package com.healthconnect.android;
import org.json.*;
import javax.net.ssl.HttpsURLConnection;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;

final class Transport {
    static class Failure extends IOException { final int status; Failure(int status,String message){super(message);this.status=status;} }
    static byte[] send(String url,String method,byte[] body,String mime,Map<String,String> headers,int max) throws Exception {
        try { return HttpTransport.send(url,method,body,mime,headers,max); }
        catch(HttpTransport.Failure failure) { throw new Failure(failure.status,failure.getMessage()); }
    }
    static Object json(String url,String method,JSONObject body,Map<String,String> headers) throws Exception {
        byte[] raw=send(url,method,body==null?null:body.toString().getBytes(StandardCharsets.UTF_8),"application/json",headers,4*1024*1024);
        if(raw.length==0)return Json.object();
        Object value=new JSONTokener(new String(raw,StandardCharsets.UTF_8)).nextValue();
        if(value instanceof JSONObject) {
            JSONObject envelope=(JSONObject)value;
            if(envelope.has("success") && !envelope.optBoolean("success"))throw new IOException("The server rejected this request.");
            if(envelope.has("data")) return envelope.opt("data");
        }
        return value;
    }
    static byte[] read(InputStream in,long limit) throws IOException {
        return HttpTransport.read(in,limit);
    }
    static String segment(String value){try{return URLEncoder.encode(value,"UTF-8").replace("+","%20");}catch(UnsupportedEncodingException impossible){throw new IllegalStateException(impossible);}}
}
