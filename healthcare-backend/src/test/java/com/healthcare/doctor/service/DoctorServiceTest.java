
package com.healthcare.doctor.service;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.repository.HospitalRepository;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DoctorService doctorService;

    @Test
    void registerShouldSaveDoctorWhenUserAndHospitalAreValid() {
        User user = mock(User.class);
        Hospital hospital = mock(Hospital.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(details.getLicenseNumber()).thenReturn("LIC-100");
        when(doctorRepository.findByLicenseNumber("LIC-100"))
                .thenReturn(Optional.empty());
        when(hospitalRepository.findById(10L))
                .thenReturn(Optional.of(hospital));
        when(hospital.isActive()).thenReturn(true);
        when(hospital.isVerified()).thenReturn(true);
        when(doctorRepository.save(details)).thenReturn(details);

        Doctor result = doctorService.register(1L, 10L, details);

        assertSame(details, result);
        verify(details).setId(null);
        verify(details).setUser(user);
        verify(details).setHospital(hospital);
        verify(doctorRepository).save(details);
    }

    @Test
    void registerShouldRejectMissingUser() {
        Doctor details = mock(Doctor.class);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectExistingDoctorProfile() {
        User user = mock(User.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L))
                .thenReturn(Optional.of(mock(Doctor.class)));

        assertThrows(
                ConflictException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectDuplicateLicense() {
        User user = mock(User.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(details.getLicenseNumber()).thenReturn("LIC-100");
        when(doctorRepository.findByLicenseNumber("LIC-100"))
                .thenReturn(Optional.of(mock(Doctor.class)));

        assertThrows(
                ConflictException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectMissingHospital() {
        User user = mock(User.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(details.getLicenseNumber()).thenReturn(null);
        when(hospitalRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectUnverifiedHospital() {
        User user = mock(User.class);
        Hospital hospital = mock(Hospital.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(details.getLicenseNumber()).thenReturn(null);
        when(hospitalRepository.findById(10L))
                .thenReturn(Optional.of(hospital));
        when(hospital.isActive()).thenReturn(true);
        when(hospital.isVerified()).thenReturn(false);

        assertThrows(
                ConflictException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectInactiveHospital() {
        User user = mock(User.class);
        Hospital hospital = mock(Hospital.class);
        Doctor details = mock(Doctor.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(details.getLicenseNumber()).thenReturn(null);
        when(hospitalRepository.findById(10L))
                .thenReturn(Optional.of(hospital));
        when(hospital.isActive()).thenReturn(false);

        assertThrows(
                ConflictException.class,
                () -> doctorService.register(1L, 10L, details)
        );

        verify(doctorRepository, never()).save(any());
    }

    @Test
    void getByIdShouldReturnDoctor() {
        Doctor doctor = mock(Doctor.class);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        assertSame(doctor, doctorService.getById(1L));
    }

    @Test
    void getByIdShouldRejectMissingDoctor() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.getById(1L)
        );
    }

    @Test
    void getByHospitalShouldRejectMissingHospital() {
        when(hospitalRepository.existsById(10L)).thenReturn(false);

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.getByHospital(10L)
        );

        verify(doctorRepository, never()).findByHospitalId(anyLong());
    }

    @Test
    void getByUserIdShouldReturnDoctor() {
        Doctor doctor = mock(Doctor.class);
        when(doctorRepository.findByUserId(1L))
                .thenReturn(Optional.of(doctor));

        assertSame(doctor, doctorService.getByUserId(1L));
    }

    @Test
    void getByUserIdShouldRejectMissingProfile() {
        when(doctorRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> doctorService.getByUserId(1L)
        );
    }
}
