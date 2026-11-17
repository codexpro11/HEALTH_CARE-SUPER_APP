package com.healthcare.nfc.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.nfc.dto.IssueNfcCredentialRequest;
import com.healthcare.nfc.dto.NfcCredentialResponse;
import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.service.NfcCredentialService;
import com.healthcare.security.principal.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nfc/credentials")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class NfcCredentialController {

    private final NfcCredentialService credentialService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<NfcCredentialResponse>>>
    getMyCredentials(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        List<NfcCredentialResponse> credentials =
                credentialService.getCredentialsForUser(
                                authenticatedUser.getUser().getId()
                        )
                        .stream()
                        .map(NfcCredentialResponse::from)
                        .toList();

        return ResponseEntity.ok(
                ApiResponse.success(
                        credentials,
                        "NFC credentials fetched successfully"
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NfcCredentialResponse>>
    issueCredential(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody IssueNfcCredentialRequest request
    ) {
        NfcCredential credential = credentialService.issueCredential(
                authenticatedUser.getUser().getId(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(
                        NfcCredentialResponse.from(credential),
                        "NFC card mapped successfully"
                )
        );
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<ApiResponse<NfcCredentialResponse>>
    revokeCredential(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long id
    ) {
        NfcCredential credential = credentialService.revokeCredential(
                authenticatedUser.getUser().getId(),
                id
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        NfcCredentialResponse.from(credential),
                        "NFC card revoked successfully"
                )
        );
    }
}