package com.healthconnect.android;

import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.KeyStore;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import javax.net.ssl.*;
import static com.healthconnect.android.TestSupport.*;

/** Actual loopback HTTPS requests. Uses a synthetic test certificate, never a live healthcare service. */
public final class TlsIntegrationTest {
    public static void main(String[] args) throws Exception {
        KeyStore keys = KeyStore.getInstance("PKCS12");
        try (InputStream input = Files.newInputStream(Path.of(args[0]))) { keys.load(input, "test-only".toCharArray()); }
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keys, "test-only".toCharArray());
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keys);
        SSLContext serverTls = SSLContext.getInstance("TLS");
        serverTls.init(kmf.getKeyManagers(), null, null);
        SSLContext clientTls = SSLContext.getInstance("TLS");
        clientTls.init(null, tmf.getTrustManagers(), null);
        HttpsServer server;
        try { server = HttpsServer.create(new InetSocketAddress("127.0.0.1", 0), 0); }
        catch (IOException blocked) {
            Throwable cause = blocked;
            while (cause.getCause() != null) cause = cause.getCause();
            if (!(cause instanceof SocketException)) throw blocked;
            System.out.println("BLOCKED: local HTTPS listener unavailable: " + cause.getClass().getSimpleName() + ": " + cause.getMessage());
            System.exit(3); return;
        }
        ExecutorService worker = Executors.newFixedThreadPool(2);
        server.setExecutor(worker);
        server.setHttpsConfigurator(new HttpsConfigurator(serverTls));
        AtomicInteger requests = new AtomicInteger(), redirected = new AtomicInteger();
        List<String> bodies = Collections.synchronizedList(new ArrayList<>());
        List<String> references = Collections.synchronizedList(new ArrayList<>());
        server.createContext("/sos", exchange -> {
            requests.incrementAndGet();
            bodies.add(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            references.add(exchange.getRequestHeaders().getFirst("Idempotency-Key"));
            boolean authorized = "Bearer synthetic-token".equals(exchange.getRequestHeaders().getFirst("Authorization"));
            reply(exchange, authorized ? 200 : 401, "{\"data\":{\"id\":\"synthetic-sos\",\"status\":\"PENDING\"}}");
        });
        server.createContext("/redirect", exchange -> { exchange.getResponseHeaders().add("Location", "/leak"); reply(exchange, 307, ""); });
        server.createContext("/leak", exchange -> { redirected.incrementAndGet(); reply(exchange, 200, "unexpected"); });
        server.createContext("/forbidden", exchange -> reply(exchange, 403, "private synthetic server error"));
        server.createContext("/conflict", exchange -> reply(exchange, 409, "slot already taken"));
        server.createContext("/oversized", exchange -> reply(exchange, 200, "x".repeat(1025)));
        server.start();
        String base = "https://localhost:" + server.getAddress().getPort();
        HttpTransport.Connections trusted = url -> {
            HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
            connection.setSSLSocketFactory(clientTls.getSocketFactory());
            return connection;
        };
        try {
            rejects(SSLException.class, () -> HttpTransport.send(base + "/sos", "GET", null, "", Map.of(), 1024), "untrusted TLS certificate");
            rejects(SSLException.class, () -> HttpTransport.send(base.replace("localhost", "127.0.0.1") + "/sos", "GET", null, "", Map.of(), 1024, trusted), "TLS hostname mismatch");
            byte[] payload = "{\"clientRequestId\":\"same-reference\"}".getBytes(StandardCharsets.UTF_8);
            Map<String, String> headers = Map.of("Authorization", "Bearer synthetic-token", "Idempotency-Key", "same-reference");
            for (int attempt = 0; attempt < 2; attempt++) {
                byte[] response = HttpTransport.send(base + "/sos", "POST", payload, "application/json", headers, 1024, trusted);
                check(new String(response, StandardCharsets.UTF_8).contains("synthetic-sos"), "HTTPS acknowledged request");
            }
            check(requests.get() == 2, "no implicit duplicate requests");
            check(bodies.size() == 2 && bodies.get(0).equals(bodies.get(1)), "explicit retry preserves payload bytes");
            check(references.equals(List.of("same-reference", "same-reference")), "explicit retry preserves idempotency key");
            for (String path : new String[]{"/redirect", "/forbidden", "/conflict"}) {
                rejects(HttpTransport.Failure.class, () -> HttpTransport.send(base + path, "GET", null, "", headers, 1024, trusted), "HTTPS rejects " + path);
            }
            check(redirected.get() == 0, "redirect never forwards authorization");
            rejects(IOException.class, () -> HttpTransport.send(base + "/oversized", "GET", null, "", headers, 1024, trusted), "HTTPS response limit");
            done("Loopback HTTPS integration");
        } finally { server.stop(0); worker.shutdownNow(); }
    }

    private static void reply(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) { output.write(bytes); }
        finally { exchange.close(); }
    }
}
