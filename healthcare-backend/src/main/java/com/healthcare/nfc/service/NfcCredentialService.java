package com.healthcare.nfc.service;

import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import com.healthcare.nfc.repository.NfcCredentialRepository;
import com.healthcare.nfc.dto.NfcCredentialResponse;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NfcCredentialService {
    private final NfcCredentialRepository credentialRepository;
    private final PatientRepository patientRepository;

    public NfcCredentialService(
        NfcCredentialRepository credentialRepository,
        PatientRepository patientRepository
    ) {
        this.credentialRepository = credentialRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public NfcCredentialResponse issueCredential(User user) {
        Patient patient = patientRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        credentialRepository.findAllByPatient_IdAndStatus(
            patient.getId(), NfcCredentialStatus.ACTIVE
        ).forEach(existing -> {
            existing.setStatus(NfcCredentialStatus.REVOKED);
            credentialRepository.save(existing);
        });

        LocalDateTime now = LocalDateTime.now();
        NfcCredential credential = NfcCredential.builder()
            .patient(patient)
            .credentialId(UUID.randomUUID().toString())
            .status(NfcCredentialStatus.ACTIVE)
            .issuedAt(now)
            .expiresAt(now.plusDays(365))
            .build();

        return NfcCredentialResponse.from(credentialRepository.save(credential));
    }

    @Transactional(readOnly = true)
    public List<NfcCredentialResponse> getMyCredentials(User user) {
        Patient patient = patientRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        return credentialRepository
            .findAllByPatient_IdOrderByCreatedAtDesc(patient.getId())
            .stream()
            .map(NfcCredentialResponse::from)
            .toList();
    }

    @Transactional
    public NfcCredentialResponse revokeCredential(Long credentialId, User user) {
        Patient patient = patientRepository.findByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        NfcCredential credential = credentialRepository.findById(credentialId)
            .orElseThrow(() -> new IllegalArgumentException("NFC credential not found"));

        if (!credential.getPatient().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("Credential does not belong to this patient");
        }
        if (credential.getStatus() != NfcCredentialStatus.ACTIVE) {
            throw new IllegalArgumentException("Credential is not active");
        }

        credential.setStatus(NfcCredentialStatus.REVOKED);
        return NfcCredentialResponse.from(credentialRepository.save(credential));
    }
}
