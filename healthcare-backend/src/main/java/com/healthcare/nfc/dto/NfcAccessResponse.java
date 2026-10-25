package com.healthcare.nfc.dto;

import com.healthcare.consent.entity.ConsentScope;

public record NfcAccessResponse(
    boolean authorized,
    String message,
    ConsentScope scope
) {
}
