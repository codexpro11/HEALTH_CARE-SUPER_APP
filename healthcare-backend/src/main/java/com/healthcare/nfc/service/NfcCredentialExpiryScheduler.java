package com.healthcare.nfc.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NfcCredentialExpiryScheduler {

    private final NfcCredentialService credentialService;

    @Scheduled(fixedDelay = 60000)
    public void expireCredentials() {
        int count = credentialService.expireCredentials();

        if (count > 0) {
            log.info("Marked {} NFC credentials as expired", count);
        }
    }
}