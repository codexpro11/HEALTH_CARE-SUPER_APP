package com.healthconnect.android;

import java.io.*;
import java.net.URL;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;

/** HTTPS byte transport, independent of Android/JSON so its wire contract is testable on the JDK. */
final class HttpTransport {
    interface Connections { HttpsURLConnection open(URL url) throws IOException; }
    static class Failure extends IOException {
        final int status;
        Failure(int status) { super(message(status)); this.status = status; }
    }

    private HttpTransport() {}

    static byte[] send(String url, String method, byte[] body, String mime, Map<String, String> headers, int max) throws Exception {
        return send(url, method, body, mime, headers, max, value -> (HttpsURLConnection) value.openConnection());
    }

    static byte[] send(String url, String method, byte[] body, String mime, Map<String, String> headers,
                       int max, Connections connections) throws Exception {
        Rules.apiEndpoint(url);
        Rules.require(max > 0 && max <= VaultCipher.MAX_PLAINTEXT, "Invalid response size limit.");
        Rules.require(java.util.Arrays.asList("GET", "POST", "PATCH", "DELETE").contains(method), "Unsupported HTTP method.");
        HttpsURLConnection connection = connections.open(new URL(url));
        try {
            connection.setConnectTimeout(12_000);
            connection.setReadTimeout(18_000);
            connection.setInstanceFollowRedirects(false);
            connection.setUseCaches(false);
            connection.setRequestMethod(method);
            connection.setRequestProperty("Accept", "application/json");
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                Rules.require(entry.getKey() != null && entry.getValue() != null
                        && !entry.getKey().matches("(?s).*[\\r\\n].*") && !entry.getValue().matches("(?s).*[\\r\\n].*"), "Invalid request header.");
                connection.setRequestProperty(entry.getKey(), entry.getValue());
            }
            if (body != null) {
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", mime);
                connection.setFixedLengthStreamingMode(body.length);
                try (OutputStream output = connection.getOutputStream()) { output.write(body); }
            }
            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                InputStream error = connection.getErrorStream();
                if (error != null) try (InputStream ignored = error) { /* Do not expose raw server errors or secrets. */ }
                throw new Failure(status);
            }
            if (connection.getContentLengthLong() > max) throw new IOException("The file or response exceeds the allowed size.");
            try (InputStream input = connection.getInputStream()) { return read(input, max); }
        } finally { connection.disconnect(); }
    }

    static byte[] read(InputStream input, long limit) throws IOException {
        if (limit < 0 || limit > VaultCipher.MAX_PLAINTEXT + 64L) throw new IOException("Invalid read limit.");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int count;
        long total = 0;
        while ((count = input.read(buffer)) != -1) {
            total += count;
            if (total > limit) throw new IOException("The file or response exceeds the allowed size.");
            output.write(buffer, 0, count);
        }
        return output.toByteArray();
    }

    private static String message(int status) {
        if (status == 401) return "Session expired. Sign in again.";
        if (status == 403) return "This account is not authorized for that action.";
        if (status == 409) return "The server reported a conflict. Refresh before trying again.";
        if (status == 429) return "Too many requests. Wait before trying again.";
        return "Request failed (HTTP " + status + "). No local success was created.";
    }
}
