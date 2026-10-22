package com.healthcare.nfc.repository;

import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NfcCredentialRepository
        extends JpaRepository<NfcCredential, Long> {

    List<NfcCredential> findAllByPatient_IdOrderByIssuedAtDesc(
            Long patientId
    );

    Optional<NfcCredential> findByIdAndPatient_Id(
            Long id,
            Long patientId
    );

    boolean existsByCredentialId(String credentialId);

    Optional<NfcCredential> findByCredentialId(String credentialId);

    List<NfcCredential> findAllByStatusAndExpiresAtIsNotNullAndExpiresAtLessThanEqual(
            NfcCredentialStatus status,
            LocalDateTime expiresAt
    );
}
