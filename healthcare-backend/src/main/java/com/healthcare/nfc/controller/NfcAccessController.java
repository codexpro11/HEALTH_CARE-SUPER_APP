package com.healthcare.nfc.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.nfc.dto.NfcAccessRequest;
import com.healthcare.nfc.dto.NfcAccessResponse;
import com.healthcare.nfc.service.NfcCredentialService;
import com.healthcare.security.principal.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nfc/access")
@RequiredArgsConstructor
public class NfcAccessController {

    private final NfcCredentialService credentialService;

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'DOCTOR')")
    public ResponseEntity<ApiResponse<NfcAccessResponse>> verifyCard(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody NfcAccessRequest request,
            HttpServletRequest httpRequest
    ) {
        NfcAccessResponse result = credentialService.verifyAccess(
                authenticatedUser.getUser(),
                request,
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(
                ApiResponse.success(result, result.message())
        );
    }
}