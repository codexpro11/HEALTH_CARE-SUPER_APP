package com.healthconnect.android;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.cert.Certificate;
import java.util.*;
import javax.net.ssl.HttpsURLConnection;
import static com.healthconnect.android.TestSupport.*;

/** Deterministic connection-contract tests; this suite does not simulate a backend authorization pass. */
public final class HttpTransportTest {
    static final class Connection extends HttpsURLConnection {
        final ByteArrayOutputStream sent = new ByteArrayOutputStream();
        final Map<String, String> request = new HashMap<>();
        byte[] response = "{\"data\":[]}".getBytes(StandardCharsets.UTF_8);
        int status = 200;
        boolean disconnected, inputClosed, errorClosed;
        long declaredLength = -1;
        Connection() throws Exception { super(new URL("https://api.example.test/api/v1/appointments")); }
        public void disconnect() { disconnected = true; }
        public boolean usingProxy() { return false; }
        public void connect() {}
        public String getCipherSuite() { return "TEST"; }
        public Certificate[] getLocalCertificates() { return null; }
        public Certificate[] getServerCertificates() { return new Certificate[0]; }
        public void setRequestProperty(String name, String value) { request.put(name, value); }
        public void setRequestMethod(String value) { method = value; }
        public OutputStream getOutputStream() { return sent; }
        public int getResponseCode() { return status; }
        public long getContentLengthLong() { return declaredLength; }
        public InputStream getInputStream() { return new ByteArrayInputStream(response) { public void close() { inputClosed = true; } }; }
        public InputStream getErrorStream() { return new ByteArrayInputStream("SECRET MEDICAL SERVER ERROR".getBytes(StandardCharsets.UTF_8)) { public void close() { errorClosed = true; } }; }
    }

    public static void main(String[] args) throws Exception {
        String endpoint = "https://api.example.test/api/v1/emergency/sos";
        byte[] payload = "{\"clientRequestId\":\"synthetic-id\"}".getBytes(StandardCharsets.UTF_8);
        Connection success = new Connection();
        byte[] result = HttpTransport.send(endpoint, "POST", payload, "application/json",
                Map.of("Authorization", "Bearer synthetic-token", "Idempotency-Key", "synthetic-id"), 1024, url -> success);
        check(Arrays.equals(result, success.response), "response round trip");
        check(Arrays.equals(payload, success.sent.toByteArray()), "exact body preserved");
        check("Bearer synthetic-token".equals(success.request.get("Authorization")), "bearer header");
        check("synthetic-id".equals(success.request.get("Idempotency-Key")), "idempotency header");
        check("application/json".equals(success.request.get("Content-Type")), "JSON content type");
        check(success.getConnectTimeout() == 12000 && success.getReadTimeout() == 18000, "bounded network timeouts");
        check(!success.getInstanceFollowRedirects() && !success.getUseCaches(), "redirects and disk caching disabled");
        check(success.disconnected && success.inputClosed, "success releases resources");
        for (int status : new int[]{301, 302, 307, 308, 400, 401, 403, 404, 409, 422, 429, 500, 503}) {
            Connection failure = new Connection(); failure.status = status;
            try {
                HttpTransport.send(endpoint, "POST", payload, "application/json", Map.of(), 1024, url -> failure);
                throw new AssertionError("accepted HTTP " + status);
            } catch (HttpTransport.Failure expected) {
                check(expected.status == status && !expected.getMessage().contains("SECRET"), "safe failure " + status);
            }
            check(failure.disconnected && failure.errorClosed, "failure releases resources " + status);
        }
        for (String invalid : new String[]{"http://api.example.test", "https://user:pass@api.example.test", "https://api.example.test/path?key=x#secret", "https://api.example.test:0/path", "https://api.example.test:65536/path"}) {
            rejects(IllegalArgumentException.class, () -> HttpTransport.send(invalid, "GET", null, "", Map.of(), 1024,
                    url -> { throw new AssertionError("invalid endpoint reached network"); }), "unsafe URL");
        }
        Connection over = new Connection(); over.response = new byte[1025];
        rejects(IOException.class, () -> HttpTransport.send(endpoint, "GET", null, "", Map.of(), 1024, url -> over), "chunked oversized response");
        check(over.disconnected && over.inputClosed, "oversized response releases resources");
        Connection declared = new Connection(); declared.declaredLength = 1025;
        rejects(IOException.class, () -> HttpTransport.send(endpoint, "GET", null, "", Map.of(), 1024, url -> declared), "declared oversized response");
        check(declared.disconnected, "declared oversized response disconnects");
        Connection noContent = new Connection(); noContent.status = 204; noContent.response = new byte[0];
        check(HttpTransport.send(endpoint, "DELETE", null, "", Map.of(), 1024, url -> noContent).length == 0, "204 empty response");
        Connection badHeader = new Connection();
        rejects(IllegalArgumentException.class, () -> HttpTransport.send(endpoint, "GET", null, "", Map.of("Authorization", "Bearer x\r\nInjected: y"), 1024, url -> badHeader), "header injection");
        check(badHeader.disconnected, "invalid header disconnects");
        rejects(IllegalArgumentException.class, () -> HttpTransport.send(endpoint, "TRACE", null, "", Map.of(), 1024), "unsupported method");
        check(HttpTransport.read(new ByteArrayInputStream(new byte[1024]), 1024).length == 1024, "exact response size boundary");
        done("HTTP contract");
    }
}
