package com.healthcare.nfc.controller;

import com.healthcare.nfc.dto.NfcCredentialResponse;
import com.healthcare.nfc.service.NfcCredentialService;
import com.healthcare.security.principal.AuthenticatedUser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nfc/credentials")
@PreAuthorize("hasRole('PATIENT')")
public class NfcCredentialController {
    private final NfcCredentialService credentialService;

    public NfcCredentialController(NfcCredentialService credentialService) {
        this.credentialService = credentialService;
    }

    @PostMapping
    public NfcCredentialResponse issue(Authentication authentication) {
        return credentialService.issueCredential(
            ((AuthenticatedUser) authentication.getPrincipal()).getUser()
        );
    }

    @GetMapping("/me")
    public List<NfcCredentialResponse> myCredentials(Authentication authentication) {
        return credentialService.getMyCredentials(
            ((AuthenticatedUser) authentication.getPrincipal()).getUser()
        );
    }

    @DeleteMapping("/{credentialId}")
    public NfcCredentialResponse revoke(
        @PathVariable Long credentialId, Authentication authentication
    ) {
        return credentialService.revokeCredential(
            credentialId,
            ((AuthenticatedUser) authentication.getPrincipal()).getUser()
        );
    }
}
