package com.healthcare.nfc.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class IssueNfcCredentialRequest {

    @NotBlank(message = "NFC credential ID is required")
    @Size(max = 29, message = "NFC credential ID is too long")
    @Pattern(
            regexp = "(?i)[0-9a-f]{2}(?:[:-]?[0-9a-f]{2}){3,9}",
            message = "Enter a valid NFC tag UID containing 4 to 10 bytes"
    )
    private String credentialId;

    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiresAt;
}