import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/** Read-only probes for a configured staging Java backend. Prints status codes, never tokens/bodies. */
public final class LiveAuthorizationProbe {
    private static final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(12))
            .followRedirects(HttpClient.Redirect.NEVER).build();
    private static String base;
    private static int passed, failed, blocked;

    public static void main(String[] args) throws Exception {
        if (args.length == 1 && "--help".equals(args[0])) {
            System.out.println("Usage: java tools/LiveAuthorizationProbe.java <HTTPS staging base URL>\nOptional environment: HC_PATIENT_A_TOKEN, HC_PATIENT_B_TOKEN, HC_PROVIDER_TOKEN, HC_PATIENT_A_RECORD_ID.\nGET requests only. Use synthetic staging accounts. Missing credentials produce BLOCKED checks and exit 3.");
            return;
        }
        if (args.length != 1) throw new IllegalArgumentException("Provide one HTTPS staging base URL, or --help.");
        URI endpoint = URI.create(args[0]);
        if (!"https".equals(endpoint.getScheme()) || endpoint.getHost() == null || endpoint.getUserInfo() != null
                || endpoint.getQuery() != null || endpoint.getFragment() != null) throw new IllegalArgumentException("Use a valid HTTPS staging base URL.");
        base = args[0].replaceAll("/$", "");
        for (String path : List.of("/users/me", "/appointments", "/medical-records", "/emergency/history", "/notifications")) {
            probe("anonymous " + path, path, null, Set.of(401));
        }
        probe("invalid bearer", "/users/me", "synthetic-invalid-token", Set.of(401));
        String patientA = env("HC_PATIENT_A_TOKEN"), patientB = env("HC_PATIENT_B_TOKEN"), provider = env("HC_PROVIDER_TOKEN"), record = env("HC_PATIENT_A_RECORD_ID");
        if (patientA == null) missing("patient A profile and records");
        else {
            probe("patient A own profile", "/users/me", patientA, Set.of(200));
            probe("patient A own record list", "/medical-records", patientA, Set.of(200));
        }
        if (patientA == null || patientB == null || record == null) missing("two-patient record ownership");
        else {
            String encoded = java.net.URLEncoder.encode(record, StandardCharsets.UTF_8).replace("+", "%20");
            probe("owner file access", "/medical-records/" + encoded + "/file", patientA, Set.of(200));
            probe("other patient file denied", "/medical-records/" + encoded + "/file", patientB, Set.of(403, 404));
        }
        if (provider == null) missing("provider denied patient-only emergency history");
        else probe("provider patient-route denied", "/emergency/history", provider, Set.of(403));
        System.out.println("Live authorization: " + passed + " passed, " + failed + " failed, " + blocked + " blocked. Read-only staging probes do not cover mutation, consent or capacity enforcement.");
        if (failed > 0) System.exit(1);
        if (blocked > 0) System.exit(3);
    }

    private static void probe(String label, String path, String token, Set<Integer> expected) {
        try {
            HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(base + "/api/v1" + path)).timeout(Duration.ofSeconds(20)).GET().header("Accept", "application/json");
            if (token != null) request.header("Authorization", "Bearer " + token);
            int status = client.send(request.build(), HttpResponse.BodyHandlers.discarding()).statusCode();
            boolean okay = expected.contains(status);
            if (okay) passed++; else failed++;
            System.out.println((okay ? "PASSED " : "FAILED ") + label + " (HTTP " + status + ")");
        } catch (Exception error) {
            failed++;
            System.out.println("FAILED " + label + " (" + error.getClass().getSimpleName() + ")");
            if (error instanceof InterruptedException) Thread.currentThread().interrupt();
        }
    }
    private static String env(String name) { String value = System.getenv(name); return value == null || value.trim().isEmpty() ? null : value.trim(); }
    private static void missing(String label) { blocked++; System.out.println("BLOCKED " + label + ": staging fixtures/credentials required"); }
}
