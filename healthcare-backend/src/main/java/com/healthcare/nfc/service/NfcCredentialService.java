package com.healthcare.nfc.service;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.repository.HospitalRepository;
import com.healthcare.hospital.repository.UserHospitalRepository;
import com.healthcare.nfc.dto.IssueNfcCredentialRequest;
import com.healthcare.nfc.dto.NfcAccessRequest;
import com.healthcare.nfc.dto.NfcAccessResponse;
import com.healthcare.nfc.entity.NfcAccessAudit;
import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import com.healthcare.nfc.repository.NfcAccessAuditRepository;
import com.healthcare.nfc.repository.NfcCredentialRepository;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class NfcCredentialService {

    private final NfcCredentialRepository credentialRepository;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final UserHospitalRepository userHospitalRepository;
    private final NfcAccessAuditRepository auditRepository;

    @Transactional(readOnly = true)
    public List<NfcCredential> getCredentialsForUser(Long userId) {
        Patient patient = getPatient(userId);

        return credentialRepository
                .findAllByPatient_IdOrderByIssuedAtDesc(patient.getId());
    }

    @Transactional
    public NfcCredential issueCredential(
            Long userId,
            IssueNfcCredentialRequest request
    ) {
        Patient patient = getPatient(userId);
        String uid = normalizeUid(request.getCredentialId());

        if (credentialRepository.existsByCredentialId(uid)) {
            throw new ConflictException(
                    "This NFC tag is already mapped to a patient"
            );
        }

        NfcCredential credential = NfcCredential.builder()
                .patient(patient)
                .credentialId(uid)
                .status(NfcCredentialStatus.ACTIVE)
                .issuedAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .build();

        try {
            return credentialRepository.saveAndFlush(credential);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException(
                    "This NFC tag is already mapped to a patient"
            );
        }
    }

    @Transactional
    public NfcCredential revokeCredential(
            Long userId,
            Long credentialId
    ) {
        Patient patient = getPatient(userId);

        NfcCredential credential = credentialRepository
                .findByIdAndPatient_Id(credentialId, patient.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "NFC credential not found"
                        )
                );

        refreshExpiry(credential);

        if (credential.getStatus() == NfcCredentialStatus.REVOKED) {
            throw new ConflictException(
                    "This NFC card has already been revoked"
            );
        }

        credential.setStatus(NfcCredentialStatus.REVOKED);

        return credentialRepository.save(credential);
    }

    @Transactional
    public int expireCredentials() {
        LocalDateTime now = LocalDateTime.now();

        List<NfcCredential> expired = credentialRepository
                .findAllByStatusAndExpiresAtIsNotNullAndExpiresAtLessThanEqual(
                        NfcCredentialStatus.ACTIVE,
                        now
                );

        for (NfcCredential credential : expired) {
            credential.setStatus(NfcCredentialStatus.EXPIRED);
        }

        credentialRepository.saveAll(expired);
        return expired.size();
    }

    @Transactional
    public NfcAccessResponse verifyAccess(
            User accessor,
            NfcAccessRequest request,
            String ipAddress
    ) {
        Hospital hospital = hospitalRepository.findById(
                request.getHospitalId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Hospital not found")
        );

        boolean linked = userHospitalRepository
                .existsByUserIdAndHospitalId(
                        accessor.getId(),
                        hospital.getId()
                );

        if (!linked) {
            throw new ConflictException(
                    "You are not authorized to access this hospital"
            );
        }

        if (!hospital.isActive() || !hospital.isVerified()) {
            throw new ConflictException(
                    "Hospital is inactive or not verified"
            );
        }

        String uid = normalizeUid(request.getCredentialId());

        NfcCredential credential = credentialRepository
                .findByCredentialId(uid)
                .orElse(null);

        if (credential == null) {
            recordAudit(
                    null,
                    null,
                    accessor,
                    hospital,
                    request,
                    false,
                    "NFC credential not found",
                    ipAddress
            );

            return new NfcAccessResponse(
                    false,
                    "NFC card is not mapped",
                    null,
                    null,
                    null
            );
        }

        Patient patient = credential.getPatient();

        refreshExpiry(credential);

        if (credential.getStatus() != NfcCredentialStatus.ACTIVE) {
            String reason;

            if (credential.getStatus() == NfcCredentialStatus.REVOKED) {
                reason = "NFC card has been revoked";
            } else {
                reason = "NFC card has expired";
            }

            recordAudit(
                    credential,
                    patient,
                    accessor,
                    hospital,
                    request,
                    false,
                    reason,
                    ipAddress
            );

            return new NfcAccessResponse(
                    false,
                    reason,
                    credential.getCredentialId(),
                    patient.getId(),
                    credential.getStatus().name()
            );
        }

        credential.setLastUsedAt(LocalDateTime.now());
        credentialRepository.save(credential);

        recordAudit(
                credential,
                patient,
                accessor,
                hospital,
                request,
                true,
                null,
                ipAddress
        );

        return new NfcAccessResponse(
                true,
                "NFC card verified",
                credential.getCredentialId(),
                patient.getId(),
                credential.getStatus().name()
        );
    }

    private void refreshExpiry(NfcCredential credential) {
        if (credential.getStatus() == NfcCredentialStatus.ACTIVE
                && credential.isExpired()) {

            credential.setStatus(NfcCredentialStatus.EXPIRED);
            credentialRepository.save(credential);
        }
    }

    private void recordAudit(
            NfcCredential credential,
            Patient patient,
            User accessor,
            Hospital hospital,
            NfcAccessRequest request,
            boolean success,
            String failureReason,
            String ipAddress
    ) {
        NfcAccessAudit audit = NfcAccessAudit.builder()
                .nfcCredential(credential)
                .patient(patient)
                .accessorUser(accessor)
                .hospital(hospital)
                .accessType(request.getAccessType())
                .purpose(request.getPurpose())
                .timestamp(LocalDateTime.now())
                .success(success)
                .failureReason(failureReason)
                .ipAddress(ipAddress)
                .build();

        auditRepository.save(audit);
    }

    private Patient getPatient(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient profile not found"
                        )
                );
    }

    private String normalizeUid(String uid) {
        if (uid == null || uid.isBlank()) {
            throw new IllegalArgumentException("NFC UID is required");
        }

        return uid.replace(":", "")
                .replace("-", "")
                .trim()
                .toUpperCase(Locale.ROOT);
    }
}