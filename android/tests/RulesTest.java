package com.healthconnect.android;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.Arrays;
public class RulesTest {
    private static int checks;
    private static void check(boolean value) { checks++; if (!value) throw new AssertionError("Check " + checks); }
    private static void rejects(Runnable action) { checks++; try { action.run(); } catch (IllegalArgumentException expected) { return; } throw new AssertionError("Expected rejection " + checks); }
    public static void main(String[] args) {
        long now=System.currentTimeMillis();
        check(Rules.patient("PATIENT")); check(!Rules.patient("DOCTOR")); check(!Rules.provider("PATIENT")); check(Rules.provider("DOCTOR")); check(!Rules.provider("ADMIN"));
        check(Rules.active("PENDING")); check(!Rules.active("CANCELLED"));
        check(Rules.cancellable("emergencies","PENDING"));check(!Rules.cancellable("emergencies","DISPATCHED"));check(!Rules.cancellable("emergencies","EN_ROUTE"));
        check(Rules.cancellable("appointments","CONFIRMED"));check(!Rules.cancellable("appointments","IN_PROGRESS"));check(!Rules.cancellable("appointments","PHARMACY_PROCESSING"));
        check(Rules.cancellable("bookings","BOOKED"));check(!Rules.cancellable("bookings","COMPLETED"));check(Rules.cancellable("orders","PHARMACY_PROCESSING"));check(!Rules.cancellable("orders","DELIVERED"));check(!Rules.cancellable("foreign","CONFIRMED"));
        Rules.consent("DOCTOR",true,now+1000,now);rejects(()->Rules.consent("PATIENT",true,now+1000,now));rejects(()->Rules.consent("DOCTOR",false,now+1000,now));rejects(()->Rules.consent("DOCTOR",true,now,now));rejects(()->Rules.consent("HOSPITAL_ADMIN",true,0,now));
        Rules.quantity(1,true,false,false);Rules.quantity(20,true,true,true);rejects(()->Rules.quantity(0,true,false,false));rejects(()->Rules.quantity(21,true,false,false));rejects(()->Rules.quantity(1,false,false,false));rejects(()->Rules.quantity(1,true,true,false));
        check(!Rules.accountKey("a").equals(Rules.accountKey("b"))); check(Rules.accountKey("a").equals(Rules.accountKey("a")));
        Rules.address("Pune central station"); rejects(()->Rules.address("Pune")); rejects(()->Rules.address("a".repeat(501)));
        Rules.location(18.52,73.85,30,now,now); rejects(()->Rules.location(Double.NaN,73,1,now,now)); rejects(()->Rules.location(91,73,1,now,now)); rejects(()->Rules.location(18,181,1,now,now)); rejects(()->Rules.location(18,73,-1,now,now)); rejects(()->Rules.location(18,73,1,now-120001,now)); rejects(()->Rules.location(18,73,1,now+10001,now));
        Rules.attachment("application/pdf",100,"%PDF-1.4".getBytes(StandardCharsets.US_ASCII));
        Rules.attachment("image/jpeg",10,new byte[]{(byte)255,(byte)216,(byte)255});
        Rules.attachment("image/png",8,new byte[]{(byte)137,80,78,71,13,10,26,10});
        rejects(()->Rules.attachment("application/pdf",0,new byte[0])); rejects(()->Rules.attachment("application/pdf",Rules.MAX_FILE+1,new byte[0])); rejects(()->Rules.attachment("application/pdf",9,"<script>".getBytes(StandardCharsets.US_ASCII))); rejects(()->Rules.attachment("image/jpeg",8,new byte[]{(byte)255,(byte)216}));
        String tomorrow=LocalDate.now().plusDays(1).toString(); Rules.future(tomorrow,"10:00",now); rejects(()->Rules.future("2020-01-01","10:00",now)); rejects(()->Rules.future("bad","25:61",now));
        Rules.apiBase("https://api.example.com"); rejects(()->Rules.apiBase("http://api.example.com")); rejects(()->Rules.apiBase("https://user:secret@api.example.com")); rejects(()->Rules.apiBase("https://api.example.com/?key=x"));
        String token="HCNFC1:"+"a".repeat(32); check(Rules.readText(Rules.textPayload(token)).equals(token)); rejects(()->Rules.nfcToken("patient=123;diagnosis=abc")); rejects(()->Rules.readText(new byte[]{2,'e','n'})); rejects(()->Rules.readText(new byte[]{(byte)130,'e','n',65}));
        check(Rules.notificationTarget("https://evil.example").equals("notifications")); check(Rules.notificationTarget("emergency").equals("emergency")); check(Rules.notificationTarget(null).equals("notifications"));
        System.out.println(checks + " Java rule checks passed.");
    }
}
