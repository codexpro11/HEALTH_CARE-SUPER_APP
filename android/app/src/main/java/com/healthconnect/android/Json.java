package com.healthconnect.android;
import org.json.*;
import java.util.*;
final class Json {
    static Set<String> set(String... values) { return new HashSet<>(Arrays.asList(values)); }
    static List<String> strings(String... values) { return Arrays.asList(values); }
    static Map<String,String> map(String... pairs) { Map<String,String> out=new HashMap<>(); for(int i=0;i<pairs.length;i+=2)out.put(pairs[i],pairs[i+1]);return out; }
    static JSONObject object(Object... pairs) {
        JSONObject value=new JSONObject();
        try { for(int i=0;i<pairs.length;i+=2) value.put((String)pairs[i], pairs[i+1]); return value; }
        catch(JSONException e) { throw new IllegalStateException(e); }
    }
    static JSONArray array(Object... items) { JSONArray out=new JSONArray(); for(Object item:items) out.put(item); return out; }
    static JSONObject copy(JSONObject value) { try { return new JSONObject(value.toString()); } catch(JSONException e) { throw new IllegalStateException(e); } }
    static JSONObject parse(String value) { try { return new JSONObject(value); } catch(JSONException e) { throw new IllegalArgumentException("Saved data is unreadable. It has not been overwritten.",e); } }
    static JSONArray list(Object value) {
        if(value instanceof JSONArray) return (JSONArray)value;
        if(value instanceof JSONObject) { JSONArray content=((JSONObject)value).optJSONArray("content"); if(content!=null)return content; }
        throw new IllegalArgumentException("The server returned an unexpected list. Retry after checking the API contract.");
    }
}
