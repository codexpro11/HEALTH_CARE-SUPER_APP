package com.healthcare.nfc.repository;

import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NfcCredentialRepository extends JpaRepository<NfcCredential, Long> {
    Optional<NfcCredential> findByCredentialId(String credentialId);
    List<NfcCredential> findAllByPatient_IdOrderByCreatedAtDesc(Long patientId);
    List<NfcCredential> findAllByPatient_IdAndStatus(Long patientId, NfcCredentialStatus status);
}
