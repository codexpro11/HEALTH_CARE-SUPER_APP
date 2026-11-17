package com.healthcare.nfc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NfcAccessRequest {

    @NotBlank(message = "NFC credential ID is required")
    @Size(max = 29)
    private String credentialId;

    @NotNull(message = "Hospital ID is required")
    @Positive
    private Long hospitalId;

    @NotBlank(message = "Access type is required")
    @Size(max = 100)
    private String accessType;

    @Size(max = 1000)
    private String purpose;
}