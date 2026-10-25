package com.healthcare.nfc.service;

import com.healthcare.consent.entity.Consent;
import com.healthcare.consent.entity.ConsentScope;
import com.healthcare.consent.entity.ConsentStatus;
import com.healthcare.consent.repository.ConsentRepository;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.nfc.dto.NfcAccessResponse;
import com.healthcare.nfc.entity.NfcAccessAudit;
import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import com.healthcare.nfc.repository.NfcAccessAuditRepository;
import com.healthcare.nfc.repository.NfcCredentialRepository;
import com.healthcare.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class NfcAccessService {
    private final DoctorRepository doctorRepository;
    private final NfcCredentialRepository credentialRepository;
    private final ConsentRepository consentRepository;
    private final NfcAccessAuditRepository auditRepository;

    public NfcAccessService(
        DoctorRepository doctorRepository,
        NfcCredentialRepository credentialRepository,
        ConsentRepository consentRepository,
        NfcAccessAuditRepository auditRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.credentialRepository = credentialRepository;
        this.consentRepository = consentRepository;
        this.auditRepository = auditRepository;
    }

    @Transactional
    public NfcAccessResponse validate(
        User provider, String credentialId, ConsentScope requestedScope,
        String purpose, String ipAddress
    ) {
        Doctor doctor = doctorRepository.findByUserId(provider.getId())
            .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));

        Hospital hospital = doctor.getHospital();
        if (hospital == null) {
            throw new IllegalArgumentException("Doctor is not assigned to a hospital");
        }

        NfcCredential credential = credentialRepository.findByCredentialId(credentialId)
            .orElse(null);

        String failure = null;
        Consent authorizedConsent = null;
        LocalDateTime now = LocalDateTime.now();

        if (!provider.isActive()) {
            failure = "Provider account is inactive";
        } else if (!hospital.isActive() || !hospital.isVerified()) {
            failure = "Hospital is inactive or unverified";
        } else if (credential == null) {
            failure = "NFC credential not found";
        } else if (credential.getStatus() != NfcCredentialStatus.ACTIVE) {
            failure = "NFC credential is not active";
        } else if (credential.getExpiresAt() != null
                && !credential.getExpiresAt().isAfter(now)) {
            failure = "NFC credential has expired";
        } else {
            var consents = consentRepository.findByPatient_IdAndStatusAndScope(
                credential.getPatient().getId(),
                ConsentStatus.GRANTED,
                requestedScope
            );

            authorizedConsent = consents.stream()
                .filter(c -> c.getExpiresAt() == null || c.getExpiresAt().isAfter(now))
                .filter(c -> c.getRevokedAt() == null)
                .filter(c -> c.getProviderUser() == null
                    || c.getProviderUser().getId().equals(provider.getId()))
                .filter(c -> c.getHospital() == null
                    || c.getHospital().getId().equals(hospital.getId()))
                .findFirst()
                .orElse(null);

            if (authorizedConsent == null) {
                failure = "No valid consent for the requested information";
            }
        }

        boolean success = failure == null;
        var audit = NfcAccessAudit.builder()
            .nfcCredential(credential)
            .patient(credential == null ? null : credential.getPatient())
            .accessorUser(provider)
            .hospital(hospital)
            .accessType(requestedScope.name())
            .purpose(purpose)
            .timestamp(now)
            .success(success)
            .failureReason(failure)
            .ipAddress(ipAddress)
            .build();

        auditRepository.save(audit);

        if (success) {
            credential.setLastUsedAt(now);
            credentialRepository.save(credential);
            return new NfcAccessResponse(true, "Access authorized", requestedScope);
        }

        return new NfcAccessResponse(false, failure, null);
    }
}
