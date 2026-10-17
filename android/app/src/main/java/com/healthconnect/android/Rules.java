package com.healthconnect.android;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;

/** Pure Java rules shared by device workflows and the standalone verification suite. */
public final class Rules {
    private Rules() {}
    public static final long MAX_FILE = 10L * 1024 * 1024;
    public static final String[] EMERGENCIES = {"Medical assistance", "Breathing difficulty", "Accident or injury", "Unconscious person", "Other emergency"};
    public static String accountKey(String value) {
        try {
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder(); for (byte b : hash) out.append(String.format(Locale.ROOT, "%02x", b)); return out.toString();
        } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    public static boolean patient(String role) { return "PATIENT".equals(role); }
    public static boolean provider(String role) { return Arrays.asList("DOCTOR", "HOSPITAL_ADMIN").contains(role); }
    public static boolean active(String status) { return Arrays.asList("PENDING", "DISPATCHED", "EN_ROUTE", "ARRIVED").contains(status); }
    public static boolean cancellable(String collection,String status) {
        if("emergencies".equals(collection))return "PENDING".equals(status);
        if("appointments".equals(collection))return Arrays.asList("BOOKED","CONFIRMED").contains(status);
        if("bookings".equals(collection))return "BOOKED".equals(status);
        if("orders".equals(collection))return Arrays.asList("CONFIRMED","PHARMACY_PROCESSING").contains(status);
        return false;
    }
    public static void consent(String role,boolean matchingCredential,long expiresAt,long now) {
        require(provider(role),"Only a verified provider can request card access.");
        require(matchingCredential,"Card unavailable, replaced or revoked in this device demo.");
        require(expiresAt>now,"Patient consent is absent, revoked or expired.");
    }
    public static void quantity(int count,boolean stock,boolean prescriptionRequired,boolean prescriptionSelected) {
        require(count>=1&&count<=20,"Choose a quantity from 1–20.");
        require(stock,"This medicine is out of stock.");
        require(!prescriptionRequired||prescriptionSelected,"Select a saved prescription document.");
    }
    public static void require(boolean condition, String message) { if (!condition) throw new IllegalArgumentException(message); }
    public static void address(String address) { require(address != null && address.trim().length() >= 10 && address.length() <= 500, "Enter a location or address of 10–500 characters."); }
    public static void location(double lat, double lon, float accuracy, long captured, long now) {
        require(Double.isFinite(lat) && Math.abs(lat) <= 90 && Double.isFinite(lon) && Math.abs(lon) <= 180, "Capture a valid location.");
        require(Float.isFinite(accuracy) && accuracy >= 0, "Location accuracy is unavailable.");
        require(captured > 0 && now - captured <= 120_000 && captured - now <= 10_000, "Location expired. Capture it again or use a manual address.");
    }
    public static void future(String date, String time, long now) {
        try { require(LocalDateTime.parse(date + "T" + time).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() > now, "Choose a future time."); }
        catch (java.time.format.DateTimeParseException ex) { throw new IllegalArgumentException("Choose a valid date and time."); }
    }
    public static void attachment(String mime, long size, byte[] prefix) {
        require(size > 0 && size <= MAX_FILE, "Select a file between 1 byte and 10 MB.");
        boolean pdf = "application/pdf".equals(mime) && prefix.length >= 5 && new String(prefix, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-");
        boolean jpg = "image/jpeg".equals(mime) && prefix.length >= 3 && (prefix[0]&255)==255 && (prefix[1]&255)==216 && (prefix[2]&255)==255;
        boolean png = "image/png".equals(mime) && prefix.length >= 8 && Arrays.equals(Arrays.copyOf(prefix,8), new byte[]{(byte)137,80,78,71,13,10,26,10});
        require(pdf || jpg || png, "The file content must match PDF, JPG or PNG.");
    }
    public static void apiBase(String base) {
        apiEndpoint(base);
        require(URI.create(base).getRawQuery() == null, "Configure an HTTPS API base URL without a query.");
    }
    public static void apiEndpoint(String value) {
        require(value != null && !value.isEmpty(), "Configure a valid HTTPS endpoint.");
        URI uri = URI.create(value);
        require("https".equals(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null
            && uri.getRawFragment() == null && (uri.getPort() == -1 || uri.getPort() > 0 && uri.getPort() <= 65535),
            "Configure a valid HTTPS endpoint without credentials or a fragment.");
    }
    public static String nfcToken(String value) {
        require(value != null && value.matches("HCNFC1:[A-Za-z0-9_-]{32,128}"), "This is not a supported HealthConnect Android demo card.");
        return value;
    }
    public static byte[] textPayload(String token) {
        nfcToken(token); byte[] text = token.getBytes(StandardCharsets.UTF_8); byte[] out = new byte[text.length+3];
        out[0]=2; out[1]='e'; out[2]='n'; System.arraycopy(text,0,out,3,text.length); return out;
    }
    public static String readText(byte[] payload) {
        require(payload.length >= 4 && (payload[0]&128)==0, "NFC text encoding is unsupported.");
        int start = 1 + (payload[0]&63); require(start < payload.length, "NFC text is empty.");
        return nfcToken(new String(payload,start,payload.length-start,StandardCharsets.UTF_8));
    }
    public static String notificationTarget(String target) {
        return Arrays.asList("home", "appointments", "records", "emergency", "notifications").contains(target == null ? "" : target) ? target : "notifications";
    }
}
