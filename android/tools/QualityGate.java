import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;

/** Dependency-free Java gate. Run from android/: java tools/QualityGate.java [output-directory] */
public final class QualityGate {
    private record Result(String suite, String status, String output) {}
    private static final List<Result> results = new ArrayList<>();
    private static Path output, classes;

    public static void main(String[] args) throws Exception {
        if (args.length > 1) throw new IllegalArgumentException("Usage: java tools/QualityGate.java [output-directory]");
        output = Path.of(args.length == 1 ? args[0] : "build/quality").toAbsolutePath();
        classes = output.resolve("classes");
        Files.createDirectories(classes);
        List<String> compile = new ArrayList<>(List.of(jdk("javac"), "--release", "17", "--add-modules", "jdk.httpserver", "-encoding", "UTF-8", "-d", classes.toString()));
        for (String name : List.of("Rules", "SessionTokens", "VaultCipher", "HttpTransport")) {
            compile.add("app/src/main/java/com/healthconnect/android/" + name + ".java");
        }
        try (var files = Files.list(Path.of("tests"))) {
            files.filter(file -> file.toString().endsWith(".java")).sorted().forEach(file -> compile.add(file.toString()));
        }
        Result compilation = run("Java compilation", compile);
        if (compilation.status.equals("PASSED")) {
            for (String suite : List.of("RulesTest", "SecurityTest", "HttpTransportTest", "PlatformPolicyTest")) {
                run(suite, List.of(jdk("java"), "-cp", classes.toString(), "com.healthconnect.android." + suite));
            }
            Path certificate = output.resolve("test-tls.p12");
            // The certificate is synthetic and scoped to this quality run, never packaged with the app.
            if (Files.exists(certificate)) Files.delete(certificate);
            Result key = run("Synthetic TLS certificate", List.of(jdk("keytool"), "-genkeypair", "-storetype", "PKCS12", "-keystore", certificate.toString(),
                    "-storepass", "test-only", "-keypass", "test-only", "-alias", "localhost", "-keyalg", "RSA", "-keysize", "2048", "-validity", "2",
                    "-dname", "CN=localhost", "-ext", "SAN=dns:localhost"));
            if (key.status.equals("PASSED")) run("TlsIntegrationTest", List.of(jdk("java"), "--add-modules", "jdk.httpserver", "-cp", classes.toString(), "com.healthconnect.android.TlsIntegrationTest", certificate.toString()));
        }
        boolean passed = results.stream().allMatch(result -> result.status.equals("PASSED"));
        StringBuilder json = new StringBuilder("{\n  \"generatedAt\": " + quote(Instant.now().toString()) + ",\n  \"status\": " + quote(passed ? "PASSED" : "INCOMPLETE") + ",\n  \"suites\": [\n");
        for (int i = 0; i < results.size(); i++) {
            Result result = results.get(i);
            json.append("    {\"suite\": ").append(quote(result.suite)).append(", \"status\": ").append(quote(result.status)).append(", \"output\": ").append(quote(result.output)).append("}").append(i + 1 == results.size() ? "\n" : ",\n");
        }
        json.append("  ],\n  \"scope\": \"JDK rules, encryption, session, HTTP contracts, static manifest, loopback TLS; excludes Android device and live backend acceptance\"\n}\n");
        Files.writeString(output.resolve("results.json"), json, StandardCharsets.UTF_8);
        System.out.println("Report: " + output.resolve("results.json"));
        if (!passed) System.exit(1);
    }

    private static Result run(String suite, List<String> command) throws Exception {
        Path log = output.resolve(suite.replaceAll("[^A-Za-z0-9]", "-") + ".log");
        Process process = new ProcessBuilder(command).redirectErrorStream(true).redirectOutput(log.toFile()).start();
        boolean completed = process.waitFor(45, TimeUnit.SECONDS);
        if (!completed) { process.destroyForcibly(); process.waitFor(5, TimeUnit.SECONDS); }
        String text = Files.readString(log, StandardCharsets.UTF_8);
        String status = !completed ? "FAILED" : process.exitValue() == 0 ? "PASSED" : process.exitValue() == 3 && text.contains("BLOCKED:") ? "BLOCKED" : "FAILED";
        Result result = new Result(suite, status, !completed ? "Timed out after 45 seconds.\n" + text : text);
        results.add(result);
        System.out.println(suite + ": " + status);
        if (!status.equals("PASSED")) System.out.println(text);
        else if (suite.endsWith("Test")) System.out.print(text);
        return result;
    }

    private static String jdk(String executable) {
        return Path.of(System.getProperty("java.home"), "bin", executable + (System.getProperty("os.name").startsWith("Windows") ? ".exe" : "")).toString();
    }
    private static String quote(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n").replace("\t", "\\t") + "\"";
    }
}
