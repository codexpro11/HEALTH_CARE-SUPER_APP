package com.healthcare.nfc;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.nfc.dto.IssueNfcCredentialRequest;
import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import com.healthcare.nfc.repository.NfcCredentialRepository;
import com.healthcare.nfc.service.NfcCredentialService;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NfcCredentialServiceTest {

    @Mock
    private NfcCredentialRepository credentialRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private NfcCredentialService credentialService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .id(12L)
                .user(User.builder().id(34L).build())
                .build();
        when(patientRepository.findByUserId(34L)).thenReturn(Optional.of(patient));
    }

    @Test
    void issueCredentialNormalizesUidAndCreatesActiveMapping() {
        IssueNfcCredentialRequest request = new IssueNfcCredentialRequest();
        request.setCredentialId("04:a1-b2:C3");
        when(credentialRepository.existsByCredentialId("04A1B2C3")).thenReturn(false);
        when(credentialRepository.saveAndFlush(any(NfcCredential.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NfcCredential issued = credentialService.issueCredential(34L, request);

        assertEquals("04A1B2C3", issued.getCredentialId());
        assertEquals(NfcCredentialStatus.ACTIVE, issued.getStatus());
        assertEquals(patient, issued.getPatient());
    }

    @Test
    void issueCredentialRejectsAlreadyMappedUid() {
        IssueNfcCredentialRequest request = new IssueNfcCredentialRequest();
        request.setCredentialId("04A1B2C3");
        when(credentialRepository.existsByCredentialId("04A1B2C3")).thenReturn(true);

        assertThrows(ConflictException.class, () -> credentialService.issueCredential(34L, request));
    }

    @Test
    void revokeCredentialOnlyChangesCredentialOwnedByPatient() {
        NfcCredential credential = NfcCredential.builder()
                .id(9L)
                .patient(patient)
                .credentialId("04A1B2C3")
                .status(NfcCredentialStatus.ACTIVE)
                .build();
        when(credentialRepository.findByIdAndPatient_Id(9L, 12L)).thenReturn(Optional.of(credential));
        when(credentialRepository.save(credential)).thenReturn(credential);

        NfcCredential revoked = credentialService.revokeCredential(34L, 9L);

        assertEquals(NfcCredentialStatus.REVOKED, revoked.getStatus());
        verify(credentialRepository).save(credential);
    }

    @Test
    void revokeCredentialDoesNotExposeAnotherPatientsCredential() {
        when(credentialRepository.findByIdAndPatient_Id(9L, 12L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> credentialService.revokeCredential(34L, 9L));
    }
}
