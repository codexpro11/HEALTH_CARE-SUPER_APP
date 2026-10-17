package com.healthconnect.android;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.*;
import android.graphics.pdf.PdfRenderer;
import android.location.Location;
import android.net.Uri;
import android.os.*;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

/** Native Java Android client. The existing React application remains a separate web client. */
public final class MainActivity extends Activity {
    private Ui ui;
    private SecureStore store;
    private Session session;
    private Repository repo;
    private DeviceWorkflows device;
    private LinearLayout root,body;
    private String route="home";
    private long generation=1,screen=0;
    private boolean mutationPending;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private final Handler main=new Handler(Looper.getMainLooper());
    private Location location;
    private JSONObject uploadMetadata,exportRecord;
    private Session pickerSession;
    private AlertDialog sensitiveDialog;
    private TextView screenLabel;
    private static final int PICK_FILE=51,EXPORT_FILE=52;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved); getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);ui=new Ui(this);device=new DeviceWorkflows(this);
        if(Build.VERSION.SDK_INT>=33)getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,this::back);
        try{store=new SecureStore(this);}catch(Exception error){ui.message("Secure storage unavailable","HealthConnect cannot open secure storage. Restart the app. Existing files were not replaced.");return;}
        Object retained=getLastNonConfigurationInstance();
        if(retained instanceof Session){session=(Session)retained;repo=new Repository(this,session,store);go(saved==null?"home":saved.getString("route","home"));return;}
        if(BuildConfig.DEMO_MODE){login();return;}
        frame("Opening HealthConnect");ui.note(body,"Verifying your saved session…");
        long expected=generation;
        load(()->Session.restore(store,expected),restored->{if(restored==null)login();else accept(restored);});
    }
    @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);if(session!=null&&Rules.patient(session.role))go("notifications");else login();}
    @Override protected void onPause(){device.stop();if(sensitiveDialog!=null)sensitiveDialog.dismiss();location=null;super.onPause();}
    @Override protected void onDestroy(){generation++;device.stop();if(!isChangingConfigurations()&&session!=null)session.closeMemory();worker.shutdownNow();super.onDestroy();}
    @Override public Object onRetainNonConfigurationInstance(){return session;}
    @Override protected void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);out.putString("route",route);}
    private void back(){if(session!=null&&!route.equals("home"))go("home");else finish();}
    @Override public void onBackPressed(){back();}
    @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] grants){
        super.onRequestPermissionsResult(request,permissions,grants);
        if(request==DeviceWorkflows.NOTIFICATION_PERMISSION){boolean allowed=grants.length>0&&grants[0]==PackageManager.PERMISSION_GRANTED;setAlertsEnabled(allowed);message(allowed?"Device alerts enabled":"Device alerts unavailable",allowed?"You can test an alert from the Inbox. Background push is not connected.":"Your inbox continues to work. You can change permission in Android settings.");}
    }
    void message(String title,String text){ui.message(title,text);}
    private void frame(String title){
        screen++;device.stop();if(sensitiveDialog!=null)sensitiveDialog.dismiss();
        root=ui.column();root.setBackgroundColor(Ui.BG);
        if(Build.VERSION.SDK_INT>=30)root.setOnApplyWindowInsetsListener((v,insets)->{
            android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());
            android.graphics.Insets keyboard=insets.getInsets(WindowInsets.Type.ime());v.setPadding(bars.left,bars.top,bars.right,Math.max(bars.bottom,keyboard.bottom));return insets;
        });
        // API 26–29 use legacy insets; API 30+ reports IME and edge-to-edge system bars.
        else root.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        LinearLayout header=ui.column();header.setPadding(ui.dp(20),ui.dp(12),ui.dp(20),ui.dp(8));root.addView(header);
        ui.text(header,"✚  HealthConnect",20,true).setTextColor(Ui.TEAL);
        if(BuildConfig.DEMO_MODE)ui.note(header,"ANDROID DEMO · Saved on this device · No services contacted");
        else ui.note(header,"Connected to your healthcare account");
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);body=ui.column();body.setPadding(ui.dp(20),ui.dp(4),ui.dp(20),ui.dp(20));scroll.addView(body);root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        screenLabel=ui.text(body,title,28,true);if(Build.VERSION.SDK_INT>=28)screenLabel.setAccessibilityHeading(true);
        if(session!=null){
            LinearLayout nav=new LinearLayout(this);nav.setPadding(ui.dp(4),ui.dp(4),ui.dp(4),ui.dp(4));nav.setBackgroundColor(Color.WHITE);
            String[] labels=Rules.patient(session.role)?new String[]{"Home","Records","SOS","Inbox","More"}:new String[]{"Home","NFC","More"};
            String[] routes=Rules.patient(session.role)?new String[]{"home","records","emergency","notifications","more"}:new String[]{"home","scanner","more"};
            for(int i=0;i<labels.length;i++){String next=routes[i];Button button=new Button(this);button.setText(labels[i]);button.setAllCaps(false);button.setTextSize(11);button.setMinWidth(0);button.setPadding(0,0,0,0);button.setTextColor(Ui.TEAL);button.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));nav.addView(button,new LinearLayout.LayoutParams(0,ui.dp(52),1));button.setOnClickListener(v->go(next));}root.addView(nav);
        }
        setContentView(root);root.requestApplyInsets();
    }
    private <T> void load(Callable<T> task,Consumer<T> success){execute(task,success,false);}
    private <T> void mutate(Callable<T> task,Consumer<T> success){if(mutationPending){Toast.makeText(this,"Wait for the current action to finish.",Toast.LENGTH_SHORT).show();return;}execute(task,success,true);}
    private <T> void execute(Callable<T> task,Consumer<T> success,boolean mutation){
        long expectedGeneration=generation,expectedScreen=screen;if(mutation)mutationPending=true;
        if(mutation)Toast.makeText(this,"Saving…",Toast.LENGTH_SHORT).show();
        worker.execute(()->{
            try{T result=task.call();main.post(()->{if(mutation)mutationPending=false;if(expectedGeneration!=generation||isDestroyed()){if(result instanceof Session)((Session)result).clear();return;}if(expectedScreen==screen)success.accept(result);});}
            catch(Exception error){main.post(()->{
                if(mutation)mutationPending=false;if(expectedGeneration!=generation||expectedScreen!=screen||isDestroyed())return;
                String text=error.getMessage();if(text==null||text.isEmpty())text="This action could not be completed. Try again.";
                if(mutation)message("Action not completed",text);
                else {ui.note(body,text);ui.button(body,session==null?"Back to sign in":"Retry",()->{if(session==null)login();else go(route);});}
            });}
        });
    }
    private void login(){
        frame("Your health, connected");ui.note(body,"Manage appointments, health documents and your emergency information.");LinearLayout card=ui.card(body);
        if(BuildConfig.DEMO_MODE){
            ui.text(card,"Explore the Android app",20,true);ui.note(card,"Sample accounts are separate. Local medical documents and demo actions are encrypted on this device.");
            ui.button(card,"Continue as demo patient",()->demo("patient@healthconnect.demo","PATIENT"));
            ui.button(card,"Use second patient account",()->demo("second@healthconnect.demo","PATIENT"));
            ui.button(card,"Open doctor NFC workspace",()->demo("doctor@healthconnect.demo","DOCTOR"));return;
        }
        EditText email=ui.input(card,"Email","",android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        EditText password=ui.input(card,"Password","",android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        CheckBox remember=ui.check(card,"Remember this account on this device",false);
        ui.button(card,"Sign in",()->authenticate(email,password,remember,false));
        ui.button(card,"Create patient account",()->authenticate(email,password,remember,true));
        ui.button(card,"Reset password",()->{
            String mail=email.getText().toString().trim();if(!mail.contains("@")){message("Email needed","Enter your email address first.");return;}
            mutate(()->Transport.json("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key="+Transport.segment(BuildConfig.FIREBASE_API_KEY),"POST",Json.object("requestType","PASSWORD_RESET","email",mail),Json.map()),v->message("Password reset","If the account is eligible, Firebase will send a reset link."));
        });
    }
    private void authenticate(EditText email,EditText password,CheckBox remember,boolean register){
        String mail=email.getText().toString().trim(),secret=password.getText().toString();
        if(!mail.contains("@")||secret.length()<6){message("Check your details","Enter a valid email and a password of at least 6 characters.");return;}
        long expected=generation;boolean keep=remember.isChecked();mutate(()->Session.login(mail,secret,register,store,keep,expected),signed->{password.setText("");accept(signed);});
    }
    private void accept(Session signed){
        try{store.delete("session");signed.persist();session=signed;repo=new Repository(this,signed,store);go("home");}
        catch(Exception error){signed.clear();session=null;repo=null;login();message("Sign in not saved","Secure session storage failed. Please try again.");}
    }
    private void demo(String email,String role){generation++;session=Session.demo(email,role,store,generation);repo=new Repository(this,session,store);go("home");}
    private void logout(){
        generation++;screen++;device.stop();device.clearNotices();if(session!=null)session.clear();session=null;repo=null;location=null;uploadMetadata=null;exportRecord=null;pickerSession=null;mutationPending=false;login();
    }
    private void go(String destination){
        if(session==null){login();return;}route=destination;location=null;
        if(!Rules.patient(session.role)&&!Json.set("home","scanner","more").contains(destination)){message("Access unavailable","Use a patient account for this page.");return;}
        switch(destination){
            case "home": home();break;case "more":more();break;case "doctors":doctors();break;
            case "appointments":history("appointments","/api/v1/appointments","Appointments");break;
            case "bookings":history("bookings","/api/v1/diagnostics/bookings","Lab bookings");break;
            case "orders":history("orders","/api/v1/pharmacy/orders","Medicine orders");break;
            case "records":records();break;case "upload":upload();break;case "diagnostics":diagnostics();break;
            case "pharmacy":pharmacy();break;case "emergency":emergency();break;case "notifications":notifications();break;
            case "nfc":nfc();break;case "scanner":scanner();break;case "insurance":insurance();break;case "profile":profile();break;
            case "hospitals":directory("hospitals","/api/v1/hospitals","Hospitals");break;
            case "bloodBanks":directory("bloodBanks","/api/v1/blood-banks","Blood banks");break;
            default:home();
        }
    }
    private void home(){
        frame(Rules.patient(session.role)?"Good to see you":"Provider workspace");ui.note(body,session.email);
        if(!Rules.patient(session.role)){LinearLayout card=ui.card(body);ui.text(card,"NFC access",21,true);ui.note(card,"Read an opaque card identifier, then request authorized access. A card alone does not grant access to records.");ui.button(card,"Open NFC scanner",()->go("scanner"));ui.note(body,"Consultation management remains available in the existing web provider workspace.");return;}
        LinearLayout hero=ui.card(body);hero.setBackground(ui.shape(Ui.TEAL,20));ui.text(hero,"Care that stays with you",24,true).setTextColor(Color.WHITE);ui.text(hero,"Appointments, documents and support in one place.",15,false).setTextColor(Color.WHITE);
        ui.button(body,"Find a doctor",()->go("doctors"));ui.button(body,"My appointments",()->go("appointments"));ui.button(body,"Book a lab test",()->go("diagnostics"));ui.button(body,"Pharmacy",()->go("pharmacy"));ui.button(body,"NFC health card",()->go("nfc"));ui.button(body,"Insurance",()->go("insurance"));
        if(BuildConfig.DEMO_MODE)ui.note(body,"Android and web demos have separate local data. No payment, dispatch, clinical review or insurer submission occurs.");
    }
    private void more(){frame("Your workspace");ui.note(body,session.email+" · "+session.role);
        if(Rules.patient(session.role)){
            ui.button(body,"My profile",()->go("profile"));ui.button(body,"My appointments",()->go("appointments"));ui.button(body,"Lab bookings",()->go("bookings"));ui.button(body,"Medicine orders",()->go("orders"));ui.button(body,"Hospitals",()->go("hospitals"));ui.button(body,"Blood banks",()->go("bloodBanks"));ui.button(body,"NFC & consent",()->go("nfc"));ui.button(body,"Insurance",()->go("insurance"));
        }
        ui.button(body,"Sign out",()->ui.confirm("Sign out?","Private screens, active NFC reads, location capture and device notifications will close.",this::logout));
        ui.note(body,"Phase 7 · Quality and security\nAccount-bound encrypted storage and session validation. Device and live integration acceptance remain open. Google sign-in and FCM background push require further configuration.");
    }
    private void doctors(){
        frame("Find your doctor");Repository current=repo;load(()->current.list("doctors","/api/v1/doctors"),rows->searchable(rows,(row,parent)->{
            ui.text(parent,row.optString("name"),20,true);ui.note(parent,row.optString("specialization")+" · "+row.optString("hospitalAffiliation"));ui.note(parent,"Consultation: ₹"+row.optInt("consultationFee"));ui.button(parent,"Choose appointment",()->book(row));
        }));
    }
    private void book(JSONObject doctor){
        frame("Book an appointment");ui.text(body,doctor.optString("name"),20,true);ui.note(body,BuildConfig.DEMO_MODE?"Demo appointment slots: 09:00, 10:00, 11:00 and 14:00. No clinic is contacted.":"The server must confirm doctor availability before a booking is accepted.");
        EditText date=ui.input(body,"Date (YYYY-MM-DD)",LocalDate.now().plusDays(1).toString());EditText time=ui.input(body,"Time (24-hour HH:mm)","10:00");datePicker(date);timePicker(time);EditText reason=ui.input(body,"Reason for visit","");Repository current=repo;
        ui.button(body,"Review booking",()->{String day=date.getText().toString(),at=time.getText().toString(),why=reason.getText().toString();ui.confirm("Confirm appointment",doctor.optString("name")+"\n"+day+" at "+at,()->mutate(()->{current.book(doctor,day,at,why);return true;},v->go("appointments")));});
    }
    private interface RowRenderer {void render(JSONObject row,LinearLayout parent);}
    private void searchable(JSONArray rows,RowRenderer renderer){
        EditText search=ui.input(body,"Search","",android.text.InputType.TYPE_CLASS_TEXT);LinearLayout list=ui.column();body.addView(list);
        Runnable paint=()->{list.removeAllViews();String query=search.getText().toString().trim().toLowerCase(Locale.ROOT);int count=0;
            for(int i=rows.length()-1;i>=0;i--){JSONObject row=rows.optJSONObject(i);if(row!=null&&(query.isEmpty()||row.toString().toLowerCase(Locale.ROOT).contains(query))){renderer.render(row,ui.card(list));count++;}}
            if(count==0)ui.note(list,rows.length()==0?"Nothing saved yet. New items will appear here.":"No matching items. Try another search.");};
        search.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int a,int c,int f){}public void onTextChanged(CharSequence s,int a,int b,int c){paint.run();}public void afterTextChanged(Editable e){}});paint.run();
    }
    private void history(String name,String path,String title){
        frame(title);Repository current=repo;load(()->current.list(name,path),rows->searchable(rows,(row,card)->{
            ui.text(card,row.optString("doctorName",row.optString("testName",row.optString("medicineName","Order"))),19,true);ui.note(card,row.optString("status"));
            ui.note(card,row.optString("appointmentDate",row.optString("scheduledDate"))+" "+row.optString("appointmentTime",row.optString("scheduledTime")));
            if(name.equals("orders"))ui.note(card,"₹"+row.optDouble("finalAmount")+" · "+row.optString("deliveryAddress"));
            if(Rules.cancellable(name,row.optString("status")))ui.button(card,"Cancel",()->cancelForm(name,row.optString("id")));
        }));
    }
    private void cancelForm(String name,String id){LinearLayout form=ui.column();form.setPadding(ui.dp(20),0,ui.dp(20),0);EditText reason=ui.input(form,"Reason","");Repository current=repo;
        new AlertDialog.Builder(this).setTitle("Cancel this request?").setView(form).setNegativeButton("Keep request",null).setPositiveButton("Confirm cancellation",(d,w)->{String why=reason.getText().toString();mutate(()->{current.cancel(name,id,why);return true;},v->{if(name.equals("emergencies"))device.notifyLocal();go(route);});}).show();}
    private void diagnostics(){frame("Book a lab test");Repository current=repo;load(()->new JSONArray[]{current.list("tests","/api/v1/diagnostics/tests"),current.list("centers","/api/v1/diagnostics/centers")},data->searchable(data[0],(row,card)->{
        ui.text(card,row.optString("name"),20,true);ui.note(card,"₹"+row.optInt("price")+" · "+(row.optBoolean("homeCollectionAvailable")?"Home or center":"Center visit"));ui.button(card,"Choose test",()->diagnosticForm(row,data[1]));}));}
    private void diagnosticForm(JSONObject test,JSONArray centers){
        frame(test.optString("name"));if(centers.length()==0){ui.note(body,"No diagnostic centers are available.");return;}String[] names=new String[centers.length()];for(int i=0;i<names.length;i++)names[i]=centers.optJSONObject(i).optString("name");
        Spinner center=ui.spinner(body,"Diagnostic center",names);EditText date=ui.input(body,"Date",LocalDate.now().plusDays(1).toString());datePicker(date);EditText time=ui.input(body,"Time","09:00");timePicker(time);
        CheckBox home=ui.check(body,"Home collection",false);home.setEnabled(test.optBoolean("homeCollectionAvailable"));EditText address=ui.input(body,"Address for home collection","");Repository current=repo;
        ui.button(body,"Review lab booking",()->{String day=date.getText().toString(),at=time.getText().toString(),where=address.getText().toString();boolean collect=home.isChecked();JSONObject selected=centers.optJSONObject(center.getSelectedItemPosition());ui.confirm("Confirm lab booking",test.optString("name")+"\n"+selected.optString("name")+"\n"+day+" at "+at+(collect?"\nHome collection: "+where:"\nCenter visit"),()->mutate(()->{current.diagnostic(test,selected,day,at,collect,where);return true;},v->go("bookings")));});
    }
    private void pharmacy(){frame("Pharmacy");ui.note(body,"Orders use cash on delivery. Prescription items require a saved prescription and pharmacist review.");Repository current=repo;load(()->current.list("medicines","/api/v1/pharmacy/medicines"),rows->searchable(rows,(row,card)->{
        ui.text(card,row.optString("name"),20,true);ui.note(card,"₹"+row.optDouble("price")+(row.optBoolean("requiresPrescription")?" · Prescription required":""));ui.button(card,row.optBoolean("inStock")?"Order item":"Out of stock",()->{if(row.optBoolean("inStock"))orderForm(row);});}));}
    private void orderForm(JSONObject medicine){
        frame("Order "+medicine.optString("name"));Repository current=repo;load(()->current.list("records","/api/v1/medical-records"),records->{
            EditText quantity=ui.input(body,"Quantity (1–20)","1",android.text.InputType.TYPE_CLASS_NUMBER);EditText address=ui.input(body,"Delivery address","");List<String> ids=new ArrayList<>(),labels=new ArrayList<>();ids.add("");labels.add("Select prescription");
            for(int i=0;i<records.length();i++){JSONObject row=records.optJSONObject(i);if("PRESCRIPTION".equals(row.optString("recordType"))&&!"ARCHIVED".equals(row.optString("status"))){ids.add(row.optString("id"));labels.add(row.optString("title"));}}
            Spinner prescription=ui.spinner(body,"Prescription document",labels.toArray(new String[0]));prescription.setEnabled(medicine.optBoolean("requiresPrescription"));
            ui.note(body,"Price per item ₹"+medicine.optDouble("price")+". The live backend calculates final fees and stock. No payment is collected here.");
            ui.button(body,"Review order",()->{String count=quantity.getText().toString(),where=address.getText().toString(),document=ids.get(prescription.getSelectedItemPosition());ui.confirm("Confirm order",count+" × "+medicine.optString("name")+"\nCash on delivery\n"+where,()->mutate(()->{current.order(medicine,Integer.parseInt(count),where,document);return true;},v->go("orders")));});
        });
    }
    private void records(){frame("Your health documents");ui.button(body,"Upload PDF or image",()->go("upload"));Repository current=repo;load(()->current.list("records","/api/v1/medical-records"),rows->searchable(rows,(row,card)->{
        ui.text(card,row.optString("title"),20,true);ui.note(card,row.optString("recordType")+" · "+row.optString("date")+" · "+row.optString("status"));ui.note(card,row.optString("summary"));
        ui.button(card,"Preview",()->preview(row));ui.button(card,"Export a copy",()->{exportRecord=row;pickerSession=session;Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(row.optString("fileMimeType","application/pdf")).putExtra(Intent.EXTRA_TITLE,"health-record."+(row.optString("fileMimeType").equals("image/png")?"png":row.optString("fileMimeType").equals("image/jpeg")?"jpg":"pdf"));startActivityForResult(intent,EXPORT_FILE);});
        boolean archived="ARCHIVED".equals(row.optString("status"));ui.button(card,archived?"Restore document":"Archive document",()->ui.confirm(archived?"Restore document?":"Archive document?",row.optString("title"),()->mutate(()->{current.archive(row.optString("id"),!archived);return true;},v->go("records"))));
    }));}
    private void upload(){
        frame("Add a health document");ui.note(body,"PDF, JPG or PNG · Up to 10 MB. Android’s file picker grants access only to your selected file.");EditText title=ui.input(body,"Document title","");Spinner type=ui.spinner(body,"Record type",new String[]{"LAB_REPORT","PRESCRIPTION","DISCHARGE_SUMMARY","VACCINATION","OTHER"});EditText date=ui.input(body,"Document date",LocalDate.now().toString());datePicker(date);EditText provider=ui.input(body,"Hospital or provider","");EditText summary=ui.input(body,"Short description","");
        ui.button(body,"Choose document",()->{
            try{Rules.require(title.getText().toString().trim().length()>=3,"Enter a title of at least 3 characters.");Rules.require(!LocalDate.parse(date.getText().toString()).isAfter(LocalDate.now()),"The document date cannot be in the future.");Rules.require(provider.getText().toString().trim().length()>=2,"Enter the hospital or provider.");
                uploadMetadata=Json.object("title",title.getText().toString().trim(),"recordType",type.getSelectedItem().toString(),"date",date.getText().toString(),"provider",provider.getText().toString().trim(),"doctorName","Not provided","summary",summary.getText().toString().trim(),"confidentialityLevel",type.getSelectedItem().toString().equals("PRESCRIPTION")?"RESTRICTED":"STANDARD","tags",new JSONArray());pickerSession=session;
                Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("*/*").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/pdf","image/jpeg","image/png"});startActivityForResult(pick,PICK_FILE);
            }catch(Exception e){message("Check document details",e.getMessage()==null?"Enter a valid date.":e.getMessage());}
        });
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);if(result!=RESULT_OK||data==null||data.getData()==null)return;
        if(session==null||session!=pickerSession){message("Sign in again","The account changed while the file picker was open. Choose the document again.");return;}
        Uri uri=data.getData();Repository current=repo;
        if(request==PICK_FILE&&uploadMetadata!=null){JSONObject metadata=uploadMetadata;uploadMetadata=null;mutate(()->{
            String mime=getContentResolver().getType(uri);byte[] bytes;try(InputStream in=getContentResolver().openInputStream(uri)){if(in==null)throw new IOException("The selected file is unavailable.");bytes=Transport.read(in,Rules.MAX_FILE);}
            current.upload(metadata,bytes,mime);return true;
        },v->{go("records");message("Document saved",BuildConfig.DEMO_MODE?"Encrypted document saved in this Android demo account.":"The server accepted your document.");});}
        if(request==EXPORT_FILE&&exportRecord!=null){JSONObject record=exportRecord;exportRecord=null;mutate(()->{byte[] bytes=current.attachment(record);try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new IOException("The selected destination is unavailable.");out.write(bytes);}return true;},v->message("Copy exported","Your selected destination contains the document copy."));}
    }
    private void preview(JSONObject record){Repository current=repo;load(()->{
        byte[] bytes=current.attachment(record);
        if(record.optString("fileMimeType").equals("application/pdf")){
            File temporary=File.createTempFile("record-preview-",".pdf",getCacheDir());
            try{try(FileOutputStream out=new FileOutputStream(temporary)){out.write(bytes);}try(ParcelFileDescriptor descriptor=ParcelFileDescriptor.open(temporary,ParcelFileDescriptor.MODE_READ_ONLY);PdfRenderer renderer=new PdfRenderer(descriptor);PdfRenderer.Page page=renderer.openPage(0)){
                float scale=Math.min(2f,1600f/Math.max(page.getWidth(),page.getHeight()));Bitmap bitmap=Bitmap.createBitmap(Math.max(1,(int)(page.getWidth()*scale)),Math.max(1,(int)(page.getHeight()*scale)),Bitmap.Config.ARGB_8888);bitmap.eraseColor(Color.WHITE);page.render(bitmap,null,null,PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);return bitmap;}
            }finally{if(!temporary.delete())temporary.deleteOnExit();}
        }
        BitmapFactory.Options options=new BitmapFactory.Options();options.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);options.inSampleSize=1;while(Math.max(options.outWidth,options.outHeight)/options.inSampleSize>1600)options.inSampleSize*=2;options.inJustDecodeBounds=false;Bitmap bitmap=BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);if(bitmap==null)throw new IOException("Image preview is unavailable.");return bitmap;
    },bitmap->{ImageView image=new ImageView(this);image.setImageBitmap(bitmap);image.setAdjustViewBounds(true);image.setContentDescription("Health document preview");ScrollView scroll=new ScrollView(this);scroll.addView(image);sensitiveDialog=new AlertDialog.Builder(this).setTitle("Document preview · PDF first page").setView(scroll).setPositiveButton("Close",null).create();sensitiveDialog.setOnDismissListener(d->{image.setImageDrawable(null);bitmap.recycle();});sensitiveDialog.show();sensitiveDialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);});}
    private void emergency(){
        frame("Emergency support");LinearLayout call=ui.card(body);ui.text(call,"Need immediate help?",22,true);ui.note(call,"Use your phone to call emergency services. Saving a demo request does not send an ambulance or notify your contacts.");ui.button(call,"Open dialer · 112",()->startActivity(new Intent(Intent.ACTION_DIAL,Uri.parse("tel:112"))));
        Repository current=repo;
        if(!BuildConfig.DEMO_MODE)ui.button(body,"Retry saved SOS request",()->ui.confirm("Retry the saved request?","The original details and request reference will be resent. Check current status first if you are unsure whether the server accepted it.",()->mutate(current::retrySos,v->go("emergency"))));
        load(()->current.list("emergencies","/api/v1/emergency/history"),rows->{
            boolean active=false;for(int i=rows.length()-1;i>=0;i--){JSONObject row=rows.optJSONObject(i);LinearLayout card=ui.card(body);ui.text(card,row.optString("status")+" · "+row.optString("emergencyType"),18,true);ui.note(card,row.optString("createdAt")+"\n"+row.optString("address"));ui.note(card,"Reference: "+row.optString("id"));
                if(Rules.active(row.optString("status")))active=true;if("PENDING".equals(row.optString("status")))ui.button(card,"Cancel pending request",()->cancelForm("emergencies",row.optString("id")));}
            if(active){ui.note(body,"An emergency request is already active. Refresh to check for updates.");ui.button(body,"Refresh status",()->go("emergency"));return;}
            Spinner type=ui.spinner(body,"Type of emergency",Rules.EMERGENCIES);EditText address=ui.input(body,"Address or landmark (10–500 characters)","");TextView loc=ui.text(body,"Location: manual address",14,false);CheckBox gps=ui.check(body,"Attach captured device coordinates",false);gps.setEnabled(false);
            ui.button(body,"Capture location",()->device.locate(found->{location=found;gps.setEnabled(true);gps.setChecked(true);loc.setText("Captured ±"+Math.round(found.getAccuracy())+" m. Still enter a useful address or landmark.");},error->message("Location unavailable",error)));
            ui.button(body,"Review SOS request",()->{String kind=type.getSelectedItem().toString(),where=address.getText().toString();boolean attach=gps.isChecked();Location captured=location;
                if(attach&&captured==null){message("Capture location again","The previous capture was cleared when the app left the foreground. Capture it again or uncheck device coordinates.");return;}
                ui.confirm(BuildConfig.DEMO_MODE?"Save a demo SOS?":"Send an SOS request?",kind+"\n"+where+(BuildConfig.DEMO_MODE?"\nNo responder will be contacted.":"\nOnly a provider acknowledgement confirms dispatch. If you need urgent help, call 112."),()->mutate(()->current.sos(kind,where,attach?captured:null),v->{device.notifyLocal();go("emergency");}));});
        });
    }
    private void notifications(){
        frame("Your inbox");ui.note(body,"Device alerts show generic text. This app has no configured FCM background push.");ui.button(body,"Enable device alerts",device::enableNotifications);ui.button(body,"Turn off device alerts",()->{setAlertsEnabled(false);device.clearNotices();message("Alerts off","Your inbox still works.");});ui.button(body,"Test generic device alert",device::notifyLocal);
        Repository current=repo;ui.button(body,"Mark all as read",()->mutate(()->{current.readNotifications(null);return true;},v->go("notifications")));
        load(()->current.list("notifications","/api/v1/notifications"),rows->{int unread=0;for(int i=0;i<rows.length();i++)if(!rows.optJSONObject(i).optBoolean("read"))unread++;ui.text(body,unread+" unread",18,true);
            CheckBox onlyUnread=ui.check(body,"Show unread only",false);LinearLayout list=ui.column();body.addView(list);
            Runnable paint=()->{list.removeAllViews();int count=0;for(int i=rows.length()-1;i>=0;i--){JSONObject row=rows.optJSONObject(i);if(onlyUnread.isChecked()&&row.optBoolean("read"))continue;LinearLayout card=ui.card(list);ui.text(card,(row.optBoolean("read")?"":"● ")+row.optString("title"),19,true);ui.note(card,row.optString("message"));ui.note(card,row.optString("createdAt"));if(!row.optBoolean("read"))ui.button(card,"Mark read",()->mutate(()->{current.readNotifications(row.optString("id"));return true;},v->go("notifications")));ui.button(card,"View request",()->go(Rules.notificationTarget(row.optString("target","notifications"))));count++;}if(count==0)ui.note(list,"Your inbox has no matching notifications.");};onlyUnread.setOnCheckedChangeListener((b,c)->paint.run());paint.run();
        });
    }
    boolean alertsEnabled(){return session!=null&&getPreferences(MODE_PRIVATE).getBoolean("alerts:"+Rules.accountKey(session.uid),false);}
    void setAlertsEnabled(boolean enabled){if(session!=null)getPreferences(MODE_PRIVATE).edit().putBoolean("alerts:"+Rules.accountKey(session.uid),enabled).apply();}
    private void nfc(){
        frame("NFC health card");ui.note(body,"A card holds only an opaque identifier. Medical documents and insurance details are not written to the card.");Repository current=repo;
        if(!BuildConfig.DEMO_MODE){ui.note(body,"Live issuance and consent require the backend NFC service, which is not present in the supplied project. No local credential is created in live mode.");return;}
        load(()->current.state(),state->{String token=state.optString("nfcToken");
            if(!token.isEmpty()){LinearLayout card=ui.card(body);card.setBackground(ui.shape(Ui.TEAL,20));ui.text(card,"HEALTHCONNECT · DEMO CARD",17,true).setTextColor(Color.WHITE);ui.text(card,"•••• "+token.substring(token.length()-6).toUpperCase(Locale.ROOT),27,true).setTextColor(Color.WHITE);ui.text(card,"Active on this device",14,false).setTextColor(Color.WHITE);
                ui.button(body,"Write to NFC tag",()->ui.confirm("Write demo identifier?","Use a blank, formatted NDEF tag. Existing NDEF contents will be replaced. Do not use a bank, transit or access card.",()->{device.nfc(true,token,result->message("NFC card",result));Toast.makeText(this,"Hold a writable NDEF tag against the phone.",Toast.LENGTH_LONG).show();}));
                ui.button(body,"Copy demo identifier",()->ui.confirm("Copy identifier?","The identifier permits a demo scan only when consent is active. Clear it from the clipboard after testing.",()->{((ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("HealthConnect demo card",token));main.postDelayed(()->{ClipboardManager clipboard=(ClipboardManager)getSystemService(CLIPBOARD_SERVICE);if(clipboard.hasPrimaryClip()&&clipboard.getPrimaryClip()!=null&&clipboard.getPrimaryClip().getItemCount()>0&&token.contentEquals(clipboard.getPrimaryClip().getItemAt(0).coerceToText(this)))clipboard.setPrimaryClip(ClipData.newPlainText("",""));},60_000);}));
                ui.button(body,"Revoke card",()->ui.confirm("Revoke this card?","Future scans of this identifier will fail in this Android demo.",()->mutate(()->current.credential(false,true),v->go("nfc"))));
            }
            ui.button(body,token.isEmpty()?"Issue demo card":"Replace demo card",()->ui.confirm("Issue a demo card?","Any previous identifier will stop working in this device demo.",()->mutate(()->current.credential(true,false),v->go("nfc"))));
            ui.text(body,"Consent for demo doctor",21,true);ui.note(body,state.optLong("consentUntil")>System.currentTimeMillis()?"Active until "+Instant.ofEpochMilli(state.optLong("consentUntil")):"No active consent");ui.note(body,"Scope: display name and number of documents only. No files or medical history are shared. Consent lasts one hour.");
            ui.button(body,"Grant one-hour demo consent",()->ui.confirm("Grant demo doctor access?","The doctor persona on this device may see your saved display name and document count after scanning the active card.",()->mutate(()->{current.consent(true);return true;},v->go("nfc"))));
            ui.button(body,"Revoke consent",()->mutate(()->{current.consent(false);return true;},v->go("nfc")));
        });
    }
    private void scanner(){
        frame("Provider NFC scanner");ui.note(body,"Card possession is not authorization. The Android demo shares only display name and document count after a consent check. Live records remain closed until the backend verifies access.");
        EditText token=ui.input(body,"Opaque identifier","");ui.button(body,"Read NFC tag",()->{device.nfc(false,"",found->{if(found.startsWith("HCNFC1:")){token.setText(found);scan(found);}else message("NFC scanner",found);});Toast.makeText(this,"Hold a HealthConnect demo NDEF card against the phone.",Toast.LENGTH_LONG).show();});
        ui.button(body,"Check identifier & consent",()->scan(token.getText().toString().trim()));
    }
    private void scan(String token){Repository current=repo;load(()->current.scan(token),summary->{
        sensitiveDialog=new AlertDialog.Builder(this).setTitle("Authorized demo summary").setMessage(summary.optString("fullName")+"\nSaved documents: "+summary.optInt("recordCount")+"\nThis preview closes in 30 seconds or at consent expiry.").setPositiveButton("Close",null).create();sensitiveDialog.show();sensitiveDialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);AlertDialog shown=sensitiveDialog;main.postDelayed(shown::dismiss,Math.max(0,Math.min(30_000,summary.optLong("expiresAt")-System.currentTimeMillis())));
    });}
    private void insurance(){
        frame("Insurance");if(!BuildConfig.DEMO_MODE){ui.note(body,"Live policies and claims need the insurer/backend integration. No claim is submitted from this screen.");return;}ui.note(body,"Local policy and claim drafts. No insurer receives these details.");Repository current=repo;
        ui.button(body,"Add a policy",()->policyForm());load(()->current.state(),state->{JSONArray policies=state.optJSONArray("policies"),claims=state.optJSONArray("claims");
            ui.text(body,"Policies",21,true);if(policies.length()==0)ui.note(body,"Add your first demo policy.");for(int i=0;i<policies.length();i++){JSONObject policy=policies.optJSONObject(i);LinearLayout card=ui.card(body);ui.text(card,policy.optString("insurer"),20,true);String number=policy.optString("policyNumber");ui.note(card,"Policy •••• "+number.substring(Math.max(0,number.length()-4))+" · Cover ₹"+policy.optInt("sumInsured"));ui.button(card,"Create a claim draft",()->claimForm(policy));}
            ui.text(body,"Claim drafts",21,true);if(claims.length()==0)ui.note(body,"No claim drafts yet.");for(int i=claims.length()-1;i>=0;i--){JSONObject claim=claims.optJSONObject(i);LinearLayout card=ui.card(body);ui.text(card,claim.optString("insurer")+" · ₹"+claim.optInt("amount"),19,true);ui.note(card,claim.optString("status")+"\n"+claim.optString("description"));}
        });
    }
    private void policyForm(){frame("Add a demo policy");EditText insurer=ui.input(body,"Insurer","");EditText number=ui.input(body,"Policy number","");EditText amount=ui.input(body,"Sum insured (₹)","500000",android.text.InputType.TYPE_CLASS_NUMBER);Repository current=repo;ui.button(body,"Save local policy",()->mutate(()->{current.addPolicy(insurer.getText().toString(),number.getText().toString(),Integer.parseInt(amount.getText().toString()));return true;},v->go("insurance")));}
    private void claimForm(JSONObject policy){frame("Claim draft");ui.note(body,policy.optString("insurer"));EditText amount=ui.input(body,"Amount (₹)","",android.text.InputType.TYPE_CLASS_NUMBER);EditText description=ui.input(body,"Treatment description","");Repository current=repo;ui.button(body,"Save local claim draft",()->mutate(()->{current.claim(policy,Integer.parseInt(amount.getText().toString()),description.getText().toString());return true;},v->go("insurance")));}
    private void directory(String name,String path,String title){frame(title);ui.note(body,"Confirm current services and availability directly with the facility.");Repository current=repo;load(()->current.list(name,path),rows->searchable(rows,(row,card)->{ui.text(card,row.optString("name"),20,true);ui.note(card,row.optString("address"));ui.note(card,row.optString("specializations",row.optString("bloodGroups")));ui.note(card,row.optString("availability"));String phone=row.optString("contactNumber",row.optString("phoneNumber",""));if(phone.matches("\\+?[0-9 ()-]{7,20}"))ui.button(card,"Open facility dialer",()->startActivity(new Intent(Intent.ACTION_DIAL,Uri.fromParts("tel",phone,null))));}));}
    private void profile(){frame("My profile");Repository current=repo;load(()->current.profile(),profile->{EditText name=ui.input(body,"Full name",profile.optString("fullName"));EditText phone=ui.input(body,"Phone number",profile.optString("phoneNumber"),android.text.InputType.TYPE_CLASS_PHONE);ui.note(body,session.email);ui.button(body,"Save profile",()->mutate(()->{current.updateProfile(name.getText().toString(),phone.getText().toString());return true;},v->{go("profile");message("Profile updated","Your changes were saved.");}));});}
    private void datePicker(EditText field){ui.button((LinearLayout)field.getParent(),"Choose date",()->{LocalDate date;try{date=LocalDate.parse(field.getText().toString());}catch(Exception e){date=LocalDate.now();}new DatePickerDialog(this,(v,y,m,d)->field.setText(LocalDate.of(y,m+1,d).toString()),date.getYear(),date.getMonthValue()-1,date.getDayOfMonth()).show();});}
    private void timePicker(EditText field){ui.button((LinearLayout)field.getParent(),"Choose time",()->new TimePickerDialog(this,(v,h,m)->field.setText(String.format(Locale.ROOT,"%02d:%02d",h,m)),10,0,true).show());}
}
