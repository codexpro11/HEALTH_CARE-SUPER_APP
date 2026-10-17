package com.healthconnect.android;

import java.nio.file.*;
import java.util.*;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.*;
import static com.healthconnect.android.TestSupport.*;

/** Static manifest gates, separate from device permission/Keystore acceptance. */
public final class PlatformPolicyTest {
    private static final String ANDROID = "http://schemas.android.com/apk/res/android";
    public static void main(String[] args) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        Document manifest = factory.newDocumentBuilder().parse(Path.of("app/src/main/AndroidManifest.xml").toFile());
        Element application = (Element) manifest.getElementsByTagName("application").item(0);
        check("false".equals(application.getAttributeNS(ANDROID, "allowBackup")), "backup disabled");
        check("false".equals(application.getAttributeNS(ANDROID, "fullBackupContent")), "full backup disabled");
        check("false".equals(application.getAttributeNS(ANDROID, "usesCleartextTraffic")), "cleartext disabled");
        check("@xml/network_security_config".equals(application.getAttributeNS(ANDROID, "networkSecurityConfig")), "network security config attached");
        Set<String> permitted = Set.of("INTERNET", "ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "NFC", "POST_NOTIFICATIONS");
        NodeList permissions = manifest.getElementsByTagName("uses-permission");
        for (int i = 0; i < permissions.getLength(); i++) {
            String permission = ((Element) permissions.item(i)).getAttributeNS(ANDROID, "name");
            check(permitted.contains(permission.replace("android.permission.", "")), "bounded permission " + permission);
        }
        Document network = factory.newDocumentBuilder().parse(Path.of("app/src/main/res/xml/network_security_config.xml").toFile());
        check("false".equals(((Element) network.getElementsByTagName("base-config").item(0)).getAttribute("cleartextTrafficPermitted")), "network config denies cleartext");
        NodeList certificates = network.getElementsByTagName("certificates");
        check(certificates.getLength() == 1 && "system".equals(((Element) certificates.item(0)).getAttribute("src")), "system certificates only");
        check(manifest.getElementsByTagName("provider").getLength() == 0, "no exported document provider");
        check(manifest.getElementsByTagName("activity").getLength() == 1, "single controlled entry activity");
        done("Static platform policy");
    }
}
