import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.zip.*;

/** Render exact Phase 6/7 text changes as aligned, offline before/after code tables. */
public final class CodeReview {
    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException("Usage: java CodeReview.java <Phase6.zip> <Phase7-directory> <output.html>");
        Path archive = Path.of(args[0]), root = Path.of(args[1]);
        Map<String, String> before = new TreeMap<>(), after = new TreeMap<>();
        try (ZipFile zip = new ZipFile(archive.toFile())) {
            var entries = zip.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                String name = entry.getName().replaceFirst("^[^/]+/", "");
                if (!entry.isDirectory() && included(name)) {
                    try (InputStream input = zip.getInputStream(entry)) { before.put(name, new String(input.readAllBytes(), StandardCharsets.UTF_8).replace("\r\n", "\n")); }
                }
            }
        }
        try (var paths = Files.walk(root)) {
            for (Path path : paths.filter(Files::isRegularFile).toList()) {
                String name = root.relativize(path).toString().replace('\\', '/');
                if (included(name)) after.put(name, Files.readString(path, StandardCharsets.UTF_8).replace("\r\n", "\n"));
            }
        }
        Set<String> all = new TreeSet<>(before.keySet()); all.addAll(after.keySet());
        List<String> changed = all.stream().filter(name -> !Objects.equals(before.get(name), after.get(name))).toList();
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(archive)));
        StringBuilder html = new StringBuilder("<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>HealthConnect Phase 7 code review</title><style>");
        html.append("*{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#17263c;font:15px system-ui}header,main{max-width:1600px;margin:auto;padding:24px}header{background:#123f47;color:white;max-width:none}header p{max-width:1100px}h1{margin:0 0 12px}a{color:#086b73}header a{color:#9be8da}details{margin:18px 0;border:1px solid #cbd5e1;border-radius:8px;background:white;overflow:hidden}summary{padding:15px;cursor:pointer;font-weight:700;overflow-wrap:anywhere}.table{overflow:auto;max-height:78vh}table{border-collapse:collapse;table-layout:fixed;width:100%;min-width:1150px;font:12px/1.6 Consolas,monospace}th{position:sticky;top:0;z-index:1;background:#e2e8f0;text-align:left;padding:10px}td{width:50%;vertical-align:top;padding:0 10px;white-space:pre-wrap;overflow-wrap:anywhere;border-right:1px solid #e2e8f0}.ln{display:inline-block;min-width:42px;color:#64748b;user-select:none}.removed{background:#fff0f0}.added{background:#e8fff3}.empty{background:#f1f5f9}.badge{font:12px system-ui;background:#e2e8f0;padding:3px 8px;border-radius:20px;color:#334155}nav{columns:2;line-height:1.9}code{overflow-wrap:anywhere}@media(max-width:700px){nav{columns:1}main,header{padding:16px}}</style><header><h1>Phase 7 · Side-by-side code review</h1><p>Exact text comparison against the delivered Phase 6 archive. Expand a file to see aligned code. Green marks additions; red marks removals. Built bundles, APK binaries and generated test outputs are excluded.</p>");
        html.append("<p>").append(changed.size()).append(" changed files · Generated ").append(Instant.now()).append("</p><p>Phase 6 SHA-256: <code>").append(hash).append("</code></p><p>Verification scope and open device/live gates are documented in VERIFICATION.md and quality/DEVICE-ACCEPTANCE.md.</p></header><main><nav>");
        for (int index = 0; index < changed.size(); index++) html.append("<div><a href='#file-").append(index).append("'>").append(escape(changed.get(index))).append("</a></div>");
        html.append("</nav>");
        for (int index = 0; index < changed.size(); index++) {
            String name = changed.get(index);
            html.append("<details id='file-").append(index).append("'").append(name.contains("/src/main/java/") ? " open" : "").append("><summary>").append(escape(name)).append(" <span class='badge'>").append(before.containsKey(name) ? after.containsKey(name) ? "Modified" : "Removed" : "Added").append("</span></summary><div class='table'><table><thead><tr><th>Phase 6 · Before</th><th>Phase 7 · After</th></tr></thead><tbody>");
            aligned(html, before.getOrDefault(name, ""), after.getOrDefault(name, ""));
            html.append("</tbody></table></div></details>");
        }
        html.append("</main></html>");
        Files.writeString(Path.of(args[2]), html, StandardCharsets.UTF_8);
        System.out.println("Side-by-side review: " + changed.size() + " changed files, " + Files.size(Path.of(args[2])) + " bytes.");
    }

    private static boolean included(String name) {
        if (name.contains("/build/") || name.contains("/node_modules/") || name.contains("/dist/") || name.contains("/.gradle/") || name.startsWith("quality/results/")) return false;
        return name.endsWith(".java") || name.endsWith(".gradle") || name.endsWith(".md") || name.endsWith(".tsx") || name.endsWith(".yml");
    }

    private static void aligned(StringBuilder html, String oldText, String newText) {
        String[] old = oldText.isEmpty() ? new String[0] : oldText.split("\n", -1);
        String[] next = newText.isEmpty() ? new String[0] : newText.split("\n", -1);
        int[][] common = new int[old.length + 1][next.length + 1];
        for (int i = old.length - 1; i >= 0; i--) for (int j = next.length - 1; j >= 0; j--) common[i][j] = old[i].equals(next[j]) ? common[i + 1][j + 1] + 1 : Math.max(common[i + 1][j], common[i][j + 1]);
        int i = 0, j = 0;
        while (i < old.length || j < next.length) {
            if (i < old.length && j < next.length && old[i].equals(next[j])) { row(html, old[i], i + 1, next[j], j + 1, false); i++; j++; continue; }
            List<Integer> removed = new ArrayList<>(), added = new ArrayList<>();
            while ((i < old.length || j < next.length) && !(i < old.length && j < next.length && old[i].equals(next[j]))) {
                if (i < old.length && (j == next.length || common[i + 1][j] >= common[i][j + 1])) removed.add(i++); else added.add(j++);
            }
            for (int k = 0; k < Math.max(removed.size(), added.size()); k++) {
                int left = k < removed.size() ? removed.get(k) : -1, right = k < added.size() ? added.get(k) : -1;
                row(html, left < 0 ? null : old[left], left + 1, right < 0 ? null : next[right], right + 1, true);
            }
        }
    }
    private static void row(StringBuilder html, String left, int leftLine, String right, int rightLine, boolean changed) {
        html.append("<tr>"); cell(html, left, leftLine, changed ? "removed" : ""); cell(html, right, rightLine, changed ? "added" : ""); html.append("</tr>");
    }
    private static void cell(StringBuilder html, String text, int line, String style) {
        html.append("<td class='").append(text == null ? "empty" : style).append("'>");
        if (text != null) html.append("<span class='ln'>").append(line).append("</span>").append(escape(text));
        html.append("</td>");
    }
    private static String escape(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;"); }
}
