package com.healthconnect.android;
import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.location.*;
import android.nfc.*;
import android.nfc.tech.*;
import android.os.*;
import java.util.*;
import java.util.function.*;

/** Permissions are requested from explicit UI actions. No background location, phone calls or PHI push. */
final class DeviceWorkflows {
    static final int LOCATION_PERMISSION=41, NOTIFICATION_PERMISSION=42;
    private final MainActivity activity;
    private final Handler handler=new Handler(Looper.getMainLooper());
    private LocationManager manager;
    private LocationListener listener;
    private Runnable timeout;
    private NfcAdapter adapter;
    private boolean reading;
    private long scanGeneration;
    DeviceWorkflows(MainActivity activity){this.activity=activity;adapter=NfcAdapter.getDefaultAdapter(activity);}
    void locate(Consumer<Location> success,Consumer<String> error){
        stopLocation();
        boolean fine=activity.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED;
        boolean coarse=activity.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED;
        if(!fine&&!coarse){activity.requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},LOCATION_PERMISSION);error.accept("Choose precise or approximate location, then tap Capture location again. A manual address also works.");return;}
        manager=(LocationManager)activity.getSystemService(Context.LOCATION_SERVICE);
        String provider=fine&&manager.isProviderEnabled(LocationManager.GPS_PROVIDER)?LocationManager.GPS_PROVIDER:LocationManager.NETWORK_PROVIDER;
        if(!manager.isProviderEnabled(provider)){error.accept("Location is switched off. Enable it in device settings or use a manual address.");return;}
        listener=new LocationListener(){
            @Override public void onLocationChanged(Location location){
                try{Rules.location(location.getLatitude(),location.getLongitude(),location.getAccuracy(),location.getTime(),System.currentTimeMillis());}
                catch(IllegalArgumentException stale){return;}
                stopLocation();success.accept(location);
            }
            @Override public void onProviderDisabled(String p){stopLocation();error.accept("Location was disabled. Use a manual address.");}
            @Override public void onProviderEnabled(String p){}
            @Override public void onStatusChanged(String p,int s,Bundle extra){}
        };
        try {
            manager.requestLocationUpdates(provider,1000,0,listener,Looper.getMainLooper());
            timeout=()->{stopLocation();error.accept("Location timed out. Try again outdoors or enter an address.");};handler.postDelayed(timeout,20_000);
        }catch(SecurityException denied){stopLocation();error.accept("Location permission is unavailable. Use a manual address.");}
    }
    void stopLocation(){if(manager!=null&&listener!=null)manager.removeUpdates(listener);listener=null;if(timeout!=null)handler.removeCallbacks(timeout);timeout=null;}
    void nfc(boolean write,String token,Consumer<String> result){
        stopNfc();if(adapter==null){result.accept("This device has no NFC hardware. You can still copy a demo card identifier.");return;}
        if(!adapter.isEnabled()){result.accept("Switch on NFC in Android settings and try again.");return;}
        reading=true;
        long expected=++scanGeneration;
        adapter.enableReaderMode(activity,tag->{
            try{
                Ndef ndef=Ndef.get(tag);Rules.require(ndef!=null,"This tag does not support NDEF. Use a formatted NDEF tag.");
                ndef.connect();String value;
                try {
                    if(write){
                        Rules.nfcToken(token);NdefMessage message=new NdefMessage(new NdefRecord[]{new NdefRecord(NdefRecord.TNF_WELL_KNOWN,NdefRecord.RTD_TEXT,new byte[0],Rules.textPayload(token))});
                        Rules.require(ndef.isWritable(),"This NFC tag is read-only.");Rules.require(ndef.getMaxSize()>=message.toByteArray().length,"This NFC tag is too small.");ndef.writeNdefMessage(message);value="Card written. It contains an opaque demo identifier only.";
                    }else{
                        NdefMessage message=ndef.getNdefMessage();Rules.require(message!=null,"This NFC tag is empty.");value=null;
                        for(NdefRecord record:message.getRecords())if(record.getTnf()==NdefRecord.TNF_WELL_KNOWN&&Arrays.equals(record.getType(),NdefRecord.RTD_TEXT)){value=Rules.readText(record.getPayload());break;}
                        Rules.require(value!=null,"No supported HealthConnect text record was found.");
                    }
                }finally{ndef.close();}
                String found=value;handler.post(()->{if(reading&&scanGeneration==expected){stopNfc();result.accept(found);}});
            }catch(Exception e){handler.post(()->{if(reading&&scanGeneration==expected){stopNfc();result.accept("NFC: "+(e.getMessage()==null?"Tag connection lost. Try again.":e.getMessage()));}});}
        },NfcAdapter.FLAG_READER_NFC_A|NfcAdapter.FLAG_READER_NFC_B|NfcAdapter.FLAG_READER_NFC_F|NfcAdapter.FLAG_READER_NFC_V,null);
        handler.postDelayed(()->{if(reading&&scanGeneration==expected){stopNfc();result.accept("NFC timed out. Tap the button to try again.");}},30_000);
    }
    void stopNfc(){if(adapter!=null&&reading)adapter.disableReaderMode(activity);reading=false;scanGeneration++;}
    void enableNotifications(){
        if(Build.VERSION.SDK_INT>=33&&activity.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){activity.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_PERMISSION);return;}
        activity.setAlertsEnabled(true);activity.message("Device alerts enabled","Generic alerts can appear for actions in this app. Your inbox works even when alerts are denied. Background push is not connected.");
    }
    void notifyLocal(){
        if(!activity.alertsEnabled())return;
        NotificationManager manager=(NotificationManager)activity.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.createNotificationChannel(new NotificationChannel("updates","HealthConnect updates",NotificationManager.IMPORTANCE_DEFAULT));
        if(!manager.areNotificationsEnabled())return;
        Intent intent=new Intent(activity,MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending=PendingIntent.getActivity(activity,0,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        Notification notice=new Notification.Builder(activity,"updates").setSmallIcon(com.healthconnect.android.R.drawable.ic_health).setContentTitle("HealthConnect update").setContentText("Open HealthConnect to view your inbox.").setVisibility(Notification.VISIBILITY_PRIVATE).setContentIntent(pending).setAutoCancel(true).build();
        try{manager.notify(6,notice);}catch(SecurityException denied){/* Inbox is independent of notification permission. */}
    }
    void clearNotices(){((NotificationManager)activity.getSystemService(Context.NOTIFICATION_SERVICE)).cancelAll();}
    void stop(){stopLocation();stopNfc();}
}
