package com.healthconnect.android;
import android.content.Context;
import org.json.*;
import java.io.*;
import java.time.*;
import java.util.*;
import java.nio.charset.StandardCharsets;

/** Live endpoints match the web contract. Demo writes are encrypted, account scoped and atomic. */
final class Repository {
    final Session session;
    private final SecureStore store;
    private final Context context;
    Repository(Context context,Session session,SecureStore store) {this.context=context.getApplicationContext();this.session=session;this.store=store;}
    private String key(){return "demo-state-v1:"+session.uid;}
    private void patient(){session.ensureActive();Rules.require(Rules.patient(session.role),"This action requires a patient account.");}
    synchronized JSONObject state() throws Exception {
        session.ensureActive();
        Rules.require(BuildConfig.DEMO_MODE,"Local demo data is unavailable in live mode.");
        String saved=store.text(key()); if(saved!=null){JSONObject state=Json.parse(saved);Rules.require(state.optInt("version")==1,"Unsupported saved state. It has not been overwritten.");return state;}
        try(InputStream input=context.getAssets().open("demo.json")){return Json.parse(new String(Transport.read(input,1024*1024),StandardCharsets.UTF_8));}
    }
    private void save(JSONObject state) throws Exception {session.ensureActive();store.text(key(),state.toString());}
    Object request(String path,String method,JSONObject body) throws Exception {
        return request(path,method,body,Json.map());
    }
    private Object request(String path,String method,JSONObject body,Map<String,String> extra) throws Exception {
        Rules.require(!BuildConfig.DEMO_MODE,"Demo mode does not contact the backend.");
        Rules.require(path.startsWith("/api/v1/")&&!path.contains(".."),"Unsupported API path.");
        Map<String,String> headers=new HashMap<>(extra);headers.put("Authorization","Bearer "+session.token());
        Object result=Transport.json(BuildConfig.API_BASE_URL.replaceAll("/$","")+path,method,body,headers);
        session.ensureActive(); return result;
    }
    synchronized JSONArray list(String name,String path) throws Exception {
        if(!Json.set("doctors","centers","tests","medicines","hospitals","bloodBanks").contains(name))patient();
        if(!BuildConfig.DEMO_MODE){
            JSONArray rows=Json.list(request(path,"GET",null));
            if(name.equals("emergencies")){
                String pending=store.text("sos-reference:"+session.uid);
                for(int i=0;pending!=null&&i<rows.length();i++)if(pending.equals(rows.optJSONObject(i).optString("clientRequestId"))){clearSosDraft();break;}
            }
            return rows;
        }
        JSONArray data=state().optJSONArray(name);Rules.require(data!=null,"This list is not available.");return data;
    }
    synchronized JSONObject profile() throws Exception {
        patient(); if(!BuildConfig.DEMO_MODE)return (JSONObject)request("/api/v1/users/me","GET",null);
        JSONObject profile=state().getJSONObject("profile");profile.put("email",session.email);return profile;
    }
    synchronized void updateProfile(String name,String phone) throws Exception {
        patient();Rules.require(name.trim().length()>=2&&name.length()<=100,"Enter a full name of 2–100 characters.");Rules.require(phone.matches("\\+?[0-9 ()-]{7,20}"),"Enter a valid phone number.");
        JSONObject body=Json.object("fullName",name.trim(),"phoneNumber",phone.trim());
        if(!BuildConfig.DEMO_MODE){request("/api/v1/users/me","PATCH",body);return;}
        JSONObject state=state();state.put("profile",body);save(state);
    }
    synchronized void book(JSONObject doctor,String date,String time,String reason) throws Exception {
        patient();Rules.future(date,time,System.currentTimeMillis());Rules.require(reason.trim().length()>=3,"Enter a reason for the consultation.");
        JSONObject body=Json.object("doctorId",doctor.getString("id"),"slotDate",date,"slotTime",displayTime(time),"consultationType","IN_PERSON","reasonForVisit",reason.trim());
        if(!BuildConfig.DEMO_MODE){request("/api/v1/appointments","POST",body);return;}
        Rules.require(Json.set("09:00","10:00","11:00","14:00").contains(time),"Choose 09:00, 10:00, 11:00 or 14:00 in the demo.");
        JSONObject state=state();JSONArray list=state.getJSONArray("appointments");
        for(int i=0;i<list.length();i++){JSONObject row=list.getJSONObject(i);Rules.require(!(doctor.getString("id").equals(row.optString("doctorId"))&&date.equals(row.optString("appointmentDate"))&&displayTime(time).equals(row.optString("appointmentTime"))&&!"CANCELLED".equals(row.optString("status"))),"This slot is already booked in this account.");}
        body.put("id",UUID.randomUUID().toString()).put("doctorName",doctor.getString("name")).put("appointmentDate",date).put("appointmentTime",displayTime(time)).put("status","CONFIRMED").put("createdAt",Instant.now().toString());list.put(body);save(state);
    }
    static String displayTime(String time){return LocalTime.parse(time).format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a",Locale.US));}
    synchronized void cancel(String listName,String id,String reason) throws Exception {
        patient();Rules.require(reason.trim().length()>=3&&reason.length()<=500,"Enter a cancellation reason of 3–500 characters.");
        if(!BuildConfig.DEMO_MODE){
            if(listName.equals("appointments"))request("/api/v1/appointments/"+Transport.segment(id),"DELETE",Json.object("reason",reason));
            else if(listName.equals("emergencies")) {
                Object result=request("/api/v1/emergency/"+Transport.segment(id)+"/cancel","POST",Json.object("reason",reason));
                Rules.require(result instanceof JSONObject&&((JSONObject)result).optBoolean("cancelled"),"The server did not confirm cancellation. Refresh the request status.");
            } else request("/api/v1/"+(listName.equals("orders")?"pharmacy/orders":"diagnostics/bookings")+"/"+Transport.segment(id)+"/cancel","POST",null);
            return;
        }
        JSONObject state=state();JSONObject row=find(state.getJSONArray(listName),id);
        String status=row.optString("status");
        Rules.require(Rules.cancellable(listName,status),"This item can no longer be cancelled.");
        row.put("status","CANCELLED").put("cancellationReason",reason.trim());
        if(listName.equals("emergencies"))inbox(state,"Emergency request cancelled","Your local demo request was cancelled.","emergency");save(state);
    }
    synchronized void diagnostic(JSONObject test,JSONObject center,String date,String time,boolean home,String address) throws Exception {
        patient();Rules.future(date,time,System.currentTimeMillis());Rules.require(!home||test.optBoolean("homeCollectionAvailable"),"This test requires a center visit.");if(home)Rules.address(address);
        JSONObject body=Json.object("testId",test.getString("id"),"centerId",center.getString("id"),"scheduledDate",date,"scheduledTime",displayTime(time),"collectionType",home?"HOME_COLLECTION":"CENTER_VISIT","patientAddress",home?address.trim():"");
        if(!BuildConfig.DEMO_MODE){request("/api/v1/diagnostics/bookings","POST",body);return;}
        JSONObject state=state();body.put("id",UUID.randomUUID().toString()).put("testName",test.getString("name")).put("centerName",center.getString("name")).put("status","BOOKED");state.getJSONArray("bookings").put(body);save(state);
    }
    synchronized void order(JSONObject medicine,int quantity,String address,String prescription) throws Exception {
        patient();Rules.address(address);Rules.quantity(quantity,medicine.optBoolean("inStock"),medicine.optBoolean("requiresPrescription"),!prescription.isEmpty());
        if(medicine.optBoolean("requiresPrescription")) {
            JSONObject record=find(list("records","/api/v1/medical-records"),prescription);
            Rules.require(record.optString("recordType").equals("PRESCRIPTION")&&!record.optString("status").equals("ARCHIVED"),"Choose an active prescription document.");
        }
        JSONObject body=Json.object("items",Json.array(Json.object("medicine",medicine,"quantity",quantity)),"deliveryAddress",address.trim(),"paymentMethod","CASH_ON_DELIVERY","prescriptionRecordId",prescription);
        if(!BuildConfig.DEMO_MODE){request("/api/v1/pharmacy/orders","POST",body);return;}
        JSONObject state=state();body.put("id",UUID.randomUUID().toString()).put("medicineName",medicine.getString("name")).put("quantity",quantity).put("finalAmount",medicine.optDouble("price")*quantity).put("status",medicine.optBoolean("requiresPrescription")?"PHARMACY_PROCESSING":"CONFIRMED");state.getJSONArray("orders").put(body);save(state);
    }
    String sosReference() throws Exception {String key="sos-reference:"+session.uid;String id=store.text(key);if(id==null){id=UUID.randomUUID().toString();store.text(key,id);}return id;}
    private void clearSosDraft(){store.delete("sos-reference:"+session.uid);store.delete("sos-body:"+session.uid);}
    synchronized JSONObject retrySos() throws Exception {
        patient();Rules.require(!BuildConfig.DEMO_MODE,"Use the demo SOS form.");String draft=store.text("sos-body:"+session.uid);Rules.require(draft!=null,"There is no saved request to retry.");
        return sendSos(Json.parse(draft));
    }
    private JSONObject sendSos(JSONObject body) throws Exception {
        JSONObject result=(JSONObject)request("/api/v1/emergency/sos","POST",body,Json.map("Idempotency-Key",body.getString("clientRequestId")));
        Rules.require(!result.optString("id").isEmpty()&&!result.optString("status").isEmpty(),"Server acknowledgement is incomplete. Refresh status or retry the saved request.");clearSosDraft();return result;
    }
    synchronized JSONObject sos(String type,String address,android.location.Location location) throws Exception {
        patient();Rules.address(address);Rules.require(Arrays.asList(Rules.EMERGENCIES).contains(type),"Choose an emergency type.");
        JSONObject body=Json.object("clientRequestId",sosReference(),"emergencyType",type,"address",address.trim(),"locationSource",location==null?"MANUAL":"GPS");
        if(location!=null){Rules.location(location.getLatitude(),location.getLongitude(),location.getAccuracy(),location.getTime(),System.currentTimeMillis());body.put("latitude",location.getLatitude()).put("longitude",location.getLongitude()).put("accuracyMeters",location.getAccuracy()).put("locationCapturedAt",Instant.ofEpochMilli(location.getTime()).toString());}
        JSONObject result;
        if(!BuildConfig.DEMO_MODE){
            String previous=store.text("sos-body:"+session.uid);
            Rules.require(previous==null||previous.equals(body.toString()),"An earlier request has an unknown outcome. Refresh status or use Retry saved SOS to resend its original details.");
            store.text("sos-body:"+session.uid,body.toString());result=sendSos(body);
        }
        else {
            JSONObject state=state();JSONArray list=state.getJSONArray("emergencies");
            for(int i=0;i<list.length();i++){JSONObject old=list.getJSONObject(i);if(Rules.active(old.optString("status")))return old;}
            body.put("id",UUID.randomUUID().toString()).put("status","PENDING").put("createdAt",Instant.now().toString());list.put(body);inbox(state,"Emergency request saved","A local demo request was saved. No responder was contacted.","emergency");save(state);result=body;
        }
        clearSosDraft();return result;
    }
    static JSONObject find(JSONArray list,String id) throws JSONException {
        for(int i=0;i<list.length();i++){JSONObject row=list.getJSONObject(i);if(id.equals(row.optString("id")))return row;}throw new IllegalArgumentException("This item is unavailable in this account.");
    }
    private void inbox(JSONObject state,String title,String message,String target) throws JSONException {state.getJSONArray("notifications").put(Json.object("id",UUID.randomUUID().toString(),"title",title,"message",message,"read",false,"target",target,"createdAt",Instant.now().toString()));}
    synchronized void readNotifications(String id) throws Exception {
        patient();if(!BuildConfig.DEMO_MODE){request(id==null?"/api/v1/notifications/mark-all-read":"/api/v1/notifications/"+Transport.segment(id)+"/read",id==null?"POST":"PATCH",null);return;}
        JSONObject state=state();JSONArray list=state.getJSONArray("notifications");for(int i=0;i<list.length();i++){JSONObject row=list.getJSONObject(i);if(id==null||id.equals(row.optString("id")))row.put("read",true);}save(state);
    }
    synchronized void upload(JSONObject metadata,byte[] bytes,String mime) throws Exception {
        patient();Rules.attachment(mime,bytes.length,Arrays.copyOf(bytes,Math.min(bytes.length,8)));
        if(!BuildConfig.DEMO_MODE) {
            String boundary="hc-"+UUID.randomUUID();ByteArrayOutputStream out=new ByteArrayOutputStream();
            out.write(("--"+boundary+"\r\nContent-Disposition: form-data; name=\"metadata\"; filename=\"record.json\"\r\nContent-Type: application/json\r\n\r\n"+metadata+"\r\n--"+boundary+"\r\nContent-Disposition: form-data; name=\"file\"; filename=\"document."+(mime.equals("application/pdf")?"pdf":mime.equals("image/png")?"png":"jpg")+"\"\r\nContent-Type: "+mime+"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            out.write(bytes);out.write(("\r\n--"+boundary+"--\r\n").getBytes(StandardCharsets.UTF_8));
            Transport.send(BuildConfig.API_BASE_URL.replaceAll("/$","")+"/api/v1/medical-records","POST",out.toByteArray(),"multipart/form-data; boundary="+boundary,Json.map("Authorization","Bearer "+session.token()),1024*1024);session.ensureActive();return;
        }
        JSONObject state=state();String id=UUID.randomUUID().toString();String key="file:"+session.uid+":"+id;
        store.write(key,bytes);
        try {metadata.put("id",id).put("status","PENDING").put("fileMimeType",mime);state.getJSONArray("records").put(metadata);save(state);}
        catch(Exception e){store.delete(key);throw e;}
    }
    byte[] attachment(JSONObject record) throws Exception {
        patient();find(list("records","/api/v1/medical-records"),record.getString("id"));
        if(!BuildConfig.DEMO_MODE){byte[] bytes=Transport.send(BuildConfig.API_BASE_URL.replaceAll("/$","")+"/api/v1/medical-records/"+Transport.segment(record.getString("id"))+"/file","GET",null,"",Json.map("Authorization","Bearer "+session.token()),(int)Rules.MAX_FILE);session.ensureActive();return bytes;}
        byte[] bytes=store.read("file:"+session.uid+":"+record.getString("id"));Rules.require(bytes!=null,"This sample record has no file. Upload a document to try preview/export.");return bytes;
    }
    synchronized void archive(String id,boolean archive) throws Exception {
        patient();if(!BuildConfig.DEMO_MODE){request("/api/v1/medical-records/"+Transport.segment(id)+(archive?"/archive":"/restore"),"POST",null);return;}
        JSONObject state=state();find(state.getJSONArray("records"),id).put("status",archive?"ARCHIVED":"PENDING");save(state);
    }
    synchronized String credential(boolean replace,boolean revoke) throws Exception {
        patient();Rules.require(BuildConfig.DEMO_MODE,"Live NFC issuance requires the backend credential service. No local credential was issued.");
        JSONObject state=state();if(revoke){state.remove("nfcToken");save(state);return "";}
        String token=state.optString("nfcToken");if(replace||token.isEmpty()){token="HCNFC1:"+UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","");state.put("nfcToken",token);save(state);}return token;
    }
    synchronized void consent(boolean enabled) throws Exception {
        patient();Rules.require(BuildConfig.DEMO_MODE,"Live consent requires the backend consent service.");
        JSONObject state=state();state.put("consentUntil",enabled?System.currentTimeMillis()+3600_000:0);save(state);
    }
    JSONObject scan(String token) throws Exception {
        session.ensureActive();
        Rules.require(Rules.provider(session.role),"Only a verified provider can request card access.");Rules.nfcToken(token);
        Rules.require(BuildConfig.DEMO_MODE,"Card read. Live access requires backend membership, credential, consent and audit verification. No patient data was opened.");
        for(String email:Json.strings("patient@healthconnect.demo","second@healthconnect.demo")) {
            String saved=store.text("demo-state-v1:demo:"+email);if(saved==null)continue;JSONObject state=Json.parse(saved);
            if(!token.equals(state.optString("nfcToken")))continue;
            Rules.consent(session.role,true,state.optLong("consentUntil"),System.currentTimeMillis());
            return Json.object("fullName",state.getJSONObject("profile").optString("fullName"),"recordCount",state.getJSONArray("records").length(),"expiresAt",state.optLong("consentUntil"));
        }
        throw new IllegalArgumentException("Card unavailable, replaced or revoked in this device demo.");
    }
    synchronized void addPolicy(String insurer,String number,int amount) throws Exception {
        patient();Rules.require(BuildConfig.DEMO_MODE,"Live insurance integration is not configured.");Rules.require(insurer.trim().length()>=2&&number.trim().length()>=4&&amount>0,"Enter insurer, policy number and positive cover.");
        JSONObject state=state();state.getJSONArray("policies").put(Json.object("id",UUID.randomUUID().toString(),"insurer",insurer.trim(),"policyNumber",number.trim(),"sumInsured",amount,"status","ACTIVE"));save(state);
    }
    synchronized void claim(JSONObject policy,int amount,String description) throws Exception {
        patient();Rules.require(BuildConfig.DEMO_MODE,"Live insurance integration is not configured.");Rules.require(amount>0&&amount<=policy.optInt("sumInsured")&&description.trim().length()>=10,"Enter a claim within cover and a description of at least 10 characters.");
        JSONObject state=state();find(state.getJSONArray("policies"),policy.getString("id"));state.getJSONArray("claims").put(Json.object("id",UUID.randomUUID().toString(),"insurer",policy.optString("insurer"),"amount",amount,"description",description.trim(),"status","DRAFT"));save(state);
    }
}
