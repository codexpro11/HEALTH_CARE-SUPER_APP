package com.healthcare.nfc.dto;

import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import java.time.LocalDateTime;

public record NfcCredentialResponse(
    Long id,
    String credentialId,
    NfcCredentialStatus status,
    LocalDateTime issuedAt,
    LocalDateTime expiresAt,
    LocalDateTime lastUsedAt
) {
    public static NfcCredentialResponse from(NfcCredential credential) {
        return new NfcCredentialResponse(
            credential.getId(),
            credential.getCredentialId(),
            credential.getStatus(),
            credential.getIssuedAt(),
            credential.getExpiresAt(),
            credential.getLastUsedAt()
        );
    }
}
