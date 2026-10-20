
package com.healthcare.hospital;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.repository.HospitalRepository;
import com.healthcare.hospital.service.HospitalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HospitalServiceTest {

    @Mock
    private HospitalRepository hospitalRepository;

    @InjectMocks
    private HospitalService hospitalService;

    private Hospital hospital;

    @BeforeEach
    void setUp() {
        hospital = Hospital.builder()
                .id(1L)
                .name("City Hospital")
                .registrationNumber("REG-001")
                .address("Main Road")
                .city("Pune")
                .state("Maharashtra")
                .phone("9876543210")
                .verified(false)
                .active(true)
                .build();
    }

    @Test
    void register_ShouldSaveHospitalAsUnverifiedAndActive() {
        when(hospitalRepository.findByRegistrationNumber("REG-001"))
                .thenReturn(Optional.empty());
        when(hospitalRepository.save(any(Hospital.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Hospital result = hospitalService.register(hospital);

        assertFalse(result.isVerified());
        assertTrue(result.isActive());
        verify(hospitalRepository).save(hospital);
    }

    @Test
    void register_ShouldRejectDuplicateRegistrationNumber() {
        when(hospitalRepository.findByRegistrationNumber("REG-001"))
                .thenReturn(Optional.of(hospital));

        assertThrows(
                ConflictException.class,
                () -> hospitalService.register(hospital));

        verify(hospitalRepository, never()).save(any(Hospital.class));
    }

    @Test
    void getVerifiedHospitals_ShouldReturnRepositoryResults() {
        Hospital verifiedHospital = Hospital.builder()
                .id(2L)
                .name("Verified Hospital")
                .verified(true)
                .active(true)
                .build();

        when(hospitalRepository.findByVerifiedTrueAndActiveTrue())
                .thenReturn(List.of(verifiedHospital));

        List<Hospital> results = hospitalService.getVerifiedHospitals();

        assertEquals(1, results.size());
        assertTrue(results.get(0).isVerified());
        assertTrue(results.get(0).isActive());
    }

    @Test
    void verify_ShouldMarkHospitalAsVerified() {
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalRepository.save(any(Hospital.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Hospital result = hospitalService.verify(1L);

        assertTrue(result.isVerified());
        verify(hospitalRepository).save(hospital);
    }

    @Test
    void deactivate_ShouldMarkHospitalAsInactive() {
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(hospitalRepository.save(any(Hospital.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Hospital result = hospitalService.deactivate(1L);

        assertFalse(result.isActive());
        verify(hospitalRepository).save(hospital);
    }
}
