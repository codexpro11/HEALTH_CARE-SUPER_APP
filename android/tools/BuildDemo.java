import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.jar.*;
import java.util.zip.*;

/** Reproducible SDK-only demo builder for environments where Gradle daemon sockets are unavailable.
 * Usage: java tools/BuildDemo.java <Android SDK> <output-directory>
 * This builds DEMO_MODE=true only. Release builds must use the Gradle configuration and guard.
 */
public class BuildDemo {
    private static Path sdk,output,root,tools,androidJar;
    private static final String PACKAGE="com.healthconnect.android";
    private static final String DEMO_PACKAGE=PACKAGE+".phase7demo";
    private static void run(String... command) throws Exception {
        Process process=new ProcessBuilder(command).directory(root.toFile()).inheritIO().start();
        if(process.waitFor()!=0)throw new IOException("Build step failed: "+Path.of(command[0]).getFileName());
    }
    private static String jdk(String executable){return Path.of(System.getProperty("java.home"),"bin",executable+(System.getProperty("os.name").startsWith("Windows")?".exe":"")).toString();}
    private static String tool(String executable){return tools.resolve(executable+(System.getProperty("os.name").startsWith("Windows")?".exe":"")).toString();}
    private static void file(Path path,String text)throws Exception{Files.createDirectories(path.getParent());Files.writeString(path,text,StandardCharsets.UTF_8);}
    public static void main(String[] args)throws Exception{
        if(args.length!=2)throw new IllegalArgumentException("Usage: java tools/BuildDemo.java <Android SDK> <output-directory>");
        root=Path.of("").toAbsolutePath();sdk=Path.of(args[0]).toAbsolutePath();output=Path.of(args[1]).toAbsolutePath();Files.createDirectories(output);
        tools=sdk.resolve("build-tools/36.0.0");androidJar=sdk.resolve("platforms/android-36/android.jar");
        if(!Files.exists(androidJar)||!Files.isDirectory(tools))throw new IOException("Install Android platform 36 and build-tools 36.0.0.");
        Path generated=output.resolve("generated"),classes=output.resolve("classes"),dex=output.resolve("dex");Files.createDirectories(generated);Files.createDirectories(classes);Files.createDirectories(dex);
        String manifest=Files.readString(root.resolve("app/src/main/AndroidManifest.xml")).replace("<manifest xmlns:android=","<manifest package=\""+PACKAGE+"\" xmlns:android=");file(output.resolve("AndroidManifest.xml"),manifest);
        file(output.resolve("debug-res/values/strings.xml"),"<resources><string name=\"app_name\">HealthConnect Demo</string></resources>");
        run(tool("aapt2"),"compile","--dir",root.resolve("app/src/main/res").toString(),"-o",output.resolve("res.zip").toString());
        run(tool("aapt2"),"compile","--dir",output.resolve("debug-res").toString(),"-o",output.resolve("debug-res.zip").toString());
        run(tool("aapt2"),"link","-I",androidJar.toString(),"--manifest",output.resolve("AndroidManifest.xml").toString(),"--java",generated.toString(),"--custom-package",PACKAGE,"--rename-manifest-package",DEMO_PACKAGE,"--min-sdk-version","26","--target-sdk-version","36","--version-code","7","--version-name","0.7.0-demo","--debug-mode","-A",root.resolve("app/src/main/assets").toString(),"-o",output.resolve("resources.apk").toString(),output.resolve("res.zip").toString(),output.resolve("debug-res.zip").toString());
        file(generated.resolve("com/healthconnect/android/BuildConfig.java"),"package "+PACKAGE+"; public final class BuildConfig { public static final boolean DEBUG=true, DEMO_MODE=true; public static final String APPLICATION_ID=\""+DEMO_PACKAGE+"\", API_BASE_URL=\"\", FIREBASE_API_KEY=\"\", VERSION_NAME=\"0.7.0-demo\"; public static final int VERSION_CODE=7; }");
        List<String> compile=new ArrayList<>(List.of(jdk("javac"),"-encoding","UTF-8","--release","17","-classpath",androidJar.toString(),"-d",classes.toString()));
        try(var paths=Files.walk(root.resolve("app/src/main/java"))){paths.filter(p->p.toString().endsWith(".java")).forEach(p->compile.add(p.toString()));}
        try(var paths=Files.walk(generated)){paths.filter(p->p.toString().endsWith(".java")).forEach(p->compile.add(p.toString()));}
        run(compile.toArray(new String[0]));
        Path classJar=output.resolve("classes.jar");
        try(JarOutputStream jar=new JarOutputStream(Files.newOutputStream(classJar));var paths=Files.walk(classes)){
            for(Path path:paths.filter(Files::isRegularFile).toList()){JarEntry entry=new JarEntry(classes.relativize(path).toString().replace('\\','/'));jar.putNextEntry(entry);Files.copy(path,jar);jar.closeEntry();}
        }
        run(jdk("java"),"-cp",tools.resolve("lib/d8.jar").toString(),"com.android.tools.r8.D8","--min-api","26","--lib",androidJar.toString(),"--output",dex.toString(),classJar.toString());
        Path packed=output.resolve("packed.apk");
        try(ZipOutputStream zip=new ZipOutputStream(Files.newOutputStream(packed));ZipFile resources=new ZipFile(output.resolve("resources.apk").toFile())){
            Enumeration<? extends ZipEntry> entries=resources.entries();
            while(entries.hasMoreElements()){
                ZipEntry source=entries.nextElement();if(source.isDirectory())continue;
                ZipEntry entry=new ZipEntry(source.getName());
                if(source.getMethod()==ZipEntry.STORED||source.getName().endsWith(".arsc")){
                    entry.setMethod(ZipEntry.STORED);
                    entry.setSize(source.getSize());
                    entry.setCrc(source.getCrc());
                    entry.setCompressedSize(source.getSize());
                }
                zip.putNextEntry(entry);
                try(InputStream in=resources.getInputStream(source)){in.transferTo(zip);}
                zip.closeEntry();
            }
            try(var paths=Files.list(dex)){for(Path path:paths.filter(p->p.toString().endsWith(".dex")).toList()){zip.putNextEntry(new ZipEntry(path.getFileName().toString()));Files.copy(path,zip);zip.closeEntry();}}
        }
        Path aligned=output.resolve("aligned.apk"),key=output.resolve("demo-signing.jks"),apk=output.resolve("HealthConnect-Phase7-Demo.apk");
        run(tool("zipalign"),"-P","16","-f","4",packed.toString(),aligned.toString());
        if(!Files.exists(key))run(jdk("keytool"),"-genkeypair","-keystore",key.toString(),"-storepass","android","-keypass","android","-alias","androiddebugkey","-keyalg","RSA","-keysize","2048","-validity","10000","-dname","CN=Android Debug,O=Android,C=US");
        run(jdk("java"),"-jar",tools.resolve("lib/apksigner.jar").toString(),"sign","--ks",key.toString(),"--ks-key-alias","androiddebugkey","--ks-pass","pass:android","--key-pass","pass:android","--out",apk.toString(),aligned.toString());
        run(jdk("java"),"-jar",tools.resolve("lib/apksigner.jar").toString(),"verify","--verbose",apk.toString());
        System.out.println("Demo APK built and signature verified: "+apk);
    }
}
