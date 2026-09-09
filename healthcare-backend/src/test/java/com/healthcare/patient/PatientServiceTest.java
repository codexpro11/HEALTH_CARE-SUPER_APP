package com.healthcare.patient;

import com.healthcare.patient.dto.PatientUpdateRequest;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.service.PatientService;
import com.healthcare.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private User user;
    private Patient patient;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).build();
        patient = Patient.builder().id(1L).user(user).bloodGroup("O+").build();
    }

    @Test
    void createOrUpdatePatient_ShouldUpdateFields() {
        when(patientRepository.findByUserId(1L)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> i.getArguments()[0]);

        PatientUpdateRequest request = new PatientUpdateRequest();
        request.setBloodGroup("A+");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));

        Patient updatedPatient = patientService.createOrUpdatePatient(user, request);

        assertNotNull(updatedPatient);
        assertEquals("A+", updatedPatient.getBloodGroup());
        assertEquals(LocalDate.of(1990, 1, 1), updatedPatient.getDateOfBirth());
    }
}
