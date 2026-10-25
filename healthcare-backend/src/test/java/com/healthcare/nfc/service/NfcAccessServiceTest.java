
package com.healthcare.nfc.service;

import com.healthcare.consent.entity.ConsentScope;
import com.healthcare.consent.entity.ConsentStatus;
import com.healthcare.consent.repository.ConsentRepository;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.nfc.dto.NfcAccessResponse;
import com.healthcare.nfc.entity.NfcCredential;
import com.healthcare.nfc.entity.NfcCredentialStatus;
import com.healthcare.nfc.repository.NfcAccessAuditRepository;
import com.healthcare.nfc.repository.NfcCredentialRepository;
import com.healthcare.patient.entity.Patient;
import com.healthcare.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NfcAccessServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NfcCredentialRepository credentialRepository;

    @Mock
    private ConsentRepository consentRepository;

    @Mock
    private NfcAccessAuditRepository auditRepository;

    @InjectMocks
    private NfcAccessService accessService;

    private User provider;
    private Hospital hospital;
    private Patient patient;
    private NfcCredential credential;

    @BeforeEach
    void setUp() {
        provider = User.builder()
                .id(10L)
                .email("doctor@test.com")
                .build();

        hospital = Hospital.builder()
                .id(20L)
                .name("Test Hospital")
                .address("Test Address")
                .city("Pune")
                .state("Maharashtra")
                .active(true)
                .verified(true)
                .build();

        patient = Patient.builder()
                .id(30L)
                .build();

        credential = NfcCredential.builder()
                .id(40L)
                .patient(patient)
                .credentialId("test-credential")
                .status(NfcCredentialStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        Doctor doctor = Doctor.builder()
                .id(50L)
                .user(provider)
                .hospital(hospital)
                .build();

        when(doctorRepository.findByUserId(10L))
                .thenReturn(Optional.of(doctor));

        when(credentialRepository.findByCredentialId("test-credential"))
                .thenReturn(Optional.of(credential));
    }

    @Test
    void validateShouldAuthorizeWhenConsentIsValid() {
        var consent = com.healthcare.consent.entity.Consent.builder()
                .patient(patient)
                .providerUser(provider)
                .hospital(hospital)
                .scope(ConsentScope.MEDICAL_SUMMARY)
                .status(ConsentStatus.GRANTED)
                .expiresAt(LocalDateTime.now().plusDays(5))
                .build();

        when(consentRepository.findByPatient_IdAndStatusAndScope(
                30L, ConsentStatus.GRANTED, ConsentScope.MEDICAL_SUMMARY))
                .thenReturn(List.of(consent));

        NfcAccessResponse response = accessService.validate(
                provider,
                "test-credential",
                ConsentScope.MEDICAL_SUMMARY,
                "Patient consultation",
                "127.0.0.1");

        assertTrue(response.authorized());
        assertEquals(ConsentScope.MEDICAL_SUMMARY, response.scope());
        verify(auditRepository).save(any());
        verify(credentialRepository).save(credential);
    }

    @Test
    void validateShouldDenyWhenConsentIsMissing() {
        when(consentRepository.findByPatient_IdAndStatusAndScope(
                30L, ConsentStatus.GRANTED, ConsentScope.MEDICAL_SUMMARY))
                .thenReturn(List.of());

        NfcAccessResponse response = accessService.validate(
                provider,
                "test-credential",
                ConsentScope.MEDICAL_SUMMARY,
                "Patient consultation",
                "127.0.0.1");

        assertFalse(response.authorized());
        assertNull(response.scope());
        verify(auditRepository).save(any());
        verify(credentialRepository, never()).save(any());
    }
}
