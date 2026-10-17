package com.healthconnect.android;
import org.json.*;
import java.util.*;
import java.nio.charset.StandardCharsets;

/** Access tokens stay in memory. Only an explicitly remembered refresh token is encrypted at rest. */
final class Session {
    final String uid,email,role,name;
    final long generation;
    private final SessionTokens tokens;
    private final SecureStore store;
    private final boolean remember;
    private final String sessionId=UUID.randomUUID().toString();
    Session(JSONObject auth,JSONObject user,SecureStore store,boolean remember,long generation) {
        uid=auth.optString("localId"); email=auth.optString("email"); role=user.optString("role"); name=user.optString("fullName",email);
        tokens=new SessionTokens(uid,auth.optString("idToken"),auth.optString("refreshToken"),System.currentTimeMillis()+auth.optLong("expiresIn",3600)*1000);
        this.store=store; this.remember=remember; this.generation=generation;
    }
    static Session demo(String email,String role,SecureStore store,long generation) {
        return new Session(Json.object("localId","demo:"+email,"email",email),Json.object("role",role,"fullName",Rules.patient(role)?"Demo Patient":"Demo Doctor"),store,false,generation);
    }
    synchronized String token() throws Exception {
        ensureActive();
        String current=tokens.current(System.currentTimeMillis()); if(current!=null)return current;
        String requested=tokens.refreshToken(); JSONObject fresh=refresh(requested);
        tokens.install(requested,fresh.getString("user_id"),fresh.getString("id_token"),fresh.getString("refresh_token"),fresh.getLong("expires_in"),System.currentTimeMillis());
        persist(); return tokens.current(System.currentTimeMillis());
    }
    void persist() throws Exception {
        ensureActive();
        if(!remember)return;
        tokens.remember(refreshToken->store.text("session",Json.object("uid",uid,"email",email,"refreshToken",refreshToken,"sessionId",sessionId).toString()));
    }
    void ensureActive() { tokens.ensureActive(); }
    void closeMemory() { tokens.close(); }
    void clear() {
        closeMemory();
        try{String saved=store.text("session");if(saved!=null&&sessionId.equals(Json.parse(saved).optString("sessionId")))store.delete("session");}catch(Exception ignored){/* Corrupt data remains untouched. */}
    }
    static JSONObject refresh(String refresh) throws Exception {
        Rules.require(!refresh.isEmpty(),"Sign in again.");
        byte[] body=("grant_type=refresh_token&refresh_token="+Transport.segment(refresh)).getBytes(StandardCharsets.UTF_8);
        byte[] raw=Transport.send("https://securetoken.googleapis.com/v1/token?key="+Transport.segment(BuildConfig.FIREBASE_API_KEY),"POST",body,"application/x-www-form-urlencoded",Json.map(),1024*1024);
        return Json.parse(new String(raw,StandardCharsets.UTF_8));
    }
    static Session login(String email,String password,boolean register,SecureStore store,boolean remember,long generation) throws Exception {
        Rules.require(!BuildConfig.DEMO_MODE,"Use a sample account in this build."); Rules.apiBase(BuildConfig.API_BASE_URL);
        Rules.require(BuildConfig.FIREBASE_API_KEY.startsWith("AIza"),"Configure your Firebase web API key before using live authentication.");
        JSONObject auth=(JSONObject)Transport.json("https://identitytoolkit.googleapis.com/v1/accounts:"+(register?"signUp":"signInWithPassword")+"?key="+Transport.segment(BuildConfig.FIREBASE_API_KEY),"POST",Json.object("email",email.trim(),"password",password,"returnSecureToken",true),Json.map());
        return verified(auth,store,remember,generation);
    }
    static Session restore(SecureStore store,long generation) throws Exception {
        String text=store.text("session"); if(text==null)return null; JSONObject saved=Json.parse(text); JSONObject fresh=refresh(saved.getString("refreshToken"));
        Rules.require(saved.getString("uid").equals(fresh.getString("user_id")),"Stored account mismatch. Sign in again.");
        return verified(Json.object("localId",fresh.getString("user_id"),"email",saved.getString("email"),"idToken",fresh.getString("id_token"),"refreshToken",fresh.getString("refresh_token"),"expiresIn",fresh.getString("expires_in")),store,true,generation);
    }
    private static Session verified(JSONObject auth,SecureStore store,boolean remember,long generation) throws Exception {
        JSONObject user=(JSONObject)Transport.json(BuildConfig.API_BASE_URL.replaceAll("/$","")+"/api/v1/users/me","GET",null,Json.map("Authorization","Bearer "+auth.getString("idToken")));
        String role=user.optString("role"); Rules.require(Rules.patient(role)||Rules.provider(role),"Your account has no supported mobile workspace. Contact your administrator.");
        return new Session(auth,user,store,remember,generation);
    }
}
