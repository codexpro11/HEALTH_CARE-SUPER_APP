package com.healthcare.nfc.dto;

public record NfcAccessResponse(
        boolean authorized,
        String message,
        String credentialId,
        Long patientId,
        String status
) {}