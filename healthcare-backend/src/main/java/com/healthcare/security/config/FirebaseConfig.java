package com.healthcare.security.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.credentials.json:}")
    private String credentialsJson;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                if (StringUtils.hasText(credentialsJson)) {
                    InputStream serviceAccount = new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase application initialized with JSON credentials");
                } else if (StringUtils.hasText(credentialsPath)) {
                    InputStream serviceAccount = new FileInputStream(credentialsPath);
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase application initialized with credentials path");
                } else {
                    log.warn("No Firebase credentials provided. Defaulting to application default credentials (GOOGLE_APPLICATION_CREDENTIALS).");
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    FirebaseApp.initializeApp(options);
                }
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase", e);
        } catch (Exception e) {
            log.error("Error setting up Firebase app. Ignored if running tests.", e);
        }
    }
}
