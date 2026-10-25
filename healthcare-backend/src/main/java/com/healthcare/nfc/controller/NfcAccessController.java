package com.healthcare.nfc.controller;

import com.healthcare.consent.entity.ConsentScope;
import com.healthcare.nfc.dto.NfcAccessResponse;
import com.healthcare.nfc.service.NfcAccessService;
import com.healthcare.security.principal.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nfc/access")
@PreAuthorize("hasRole('DOCTOR')")
public class NfcAccessController {
    private final NfcAccessService accessService;

    public NfcAccessController(NfcAccessService accessService) {
        this.accessService = accessService;
    }

    @PostMapping("/validate")
    public NfcAccessResponse validate(
        @RequestBody ValidateRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        if (request.credentialId() == null || request.credentialId().isBlank()
                || request.scope() == null) {
            throw new IllegalArgumentException("Credential ID and scope are required");
        }

        return accessService.validate(
            ((AuthenticatedUser) authentication.getPrincipal()).getUser(),
            request.credentialId(),
            request.scope(),
            request.purpose(),
            httpRequest.getRemoteAddr()
        );
    }

    public record ValidateRequest(
        String credentialId,
        ConsentScope scope,
        String purpose
    ) {
    }
}
