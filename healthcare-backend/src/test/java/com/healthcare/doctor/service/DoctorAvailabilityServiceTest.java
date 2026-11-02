
package com.healthcare.doctor.service;

import com.healthcare.common.exception.BadRequestException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorAvailability;
import com.healthcare.doctor.repository.DoctorAvailabilityRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorAvailabilityServiceTest {

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorAvailabilityService availabilityService;

    @Test
    void createShouldSaveValidAvailability() {
        Doctor doctor = mock(Doctor.class);
        DoctorAvailability saved = mock(DoctorAvailability.class);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(availabilityRepository.save(any(DoctorAvailability.class)))
                .thenReturn(saved);

        DoctorAvailability result = availabilityService.create(
                1L, (short) 1, LocalTime.of(9, 0), LocalTime.of(17, 0));

        assertSame(saved, result);
        verify(availabilityRepository).save(any(DoctorAvailability.class));
    }
    @Test
void createShouldRejectOverlappingAvailability() {
    Doctor doctor = mock(Doctor.class);

    when(doctorRepository.findById(1L))
            .thenReturn(Optional.of(doctor));

    lenient().when(
            availabilityRepository
                    .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                            1L,
                            (short) 1,
                            LocalTime.of(14, 0),
                            LocalTime.of(11, 0)))
            .thenReturn(true);

    assertThrows(
            BadRequestException.class,
            () -> availabilityService.create(
                    1L,
                    (short) 1,
                    LocalTime.of(11, 0),
                    LocalTime.of(14, 0))
    );

    verify(availabilityRepository, never()).save(any());
}

    @Test
    void createShouldRejectNullWeekday() {
        assertThrows(
                BadRequestException.class,
                () -> availabilityService.create(
                        1L, null, LocalTime.of(9, 0), LocalTime.of(17, 0))
        );

        verify(doctorRepository, never()).findById(anyLong());
        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void createShouldRejectWeekdayOutsideRange() {
        assertThrows(
                BadRequestException.class,
                () -> availabilityService.create(
                        1L, (short) 8, LocalTime.of(9, 0), LocalTime.of(17, 0))
        );

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void createShouldRejectNullStartTime() {
        assertThrows(
                BadRequestException.class,
                () -> availabilityService.create(
                        1L, (short) 1, null, LocalTime.of(17, 0))
        );

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void createShouldRejectEndTimeEqualToStartTime() {
        LocalTime time = LocalTime.of(9, 0);

        assertThrows(
                BadRequestException.class,
                () -> availabilityService.create(1L, (short) 1, time, time)
        );

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void createShouldRejectEndTimeBeforeStartTime() {
        assertThrows(
                BadRequestException.class,
                () -> availabilityService.create(
                        1L, (short) 1, LocalTime.of(17, 0), LocalTime.of(9, 0))
        );

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void createShouldRejectMissingDoctor() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> availabilityService.create(
                        1L, (short) 1, LocalTime.of(9, 0), LocalTime.of(17, 0))
        );

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    void getForDoctorShouldReturnActiveAvailability() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        List<DoctorAvailability> expected = List.of(
                mock(DoctorAvailability.class));

        when(availabilityRepository.findByDoctorIdAndActiveTrue(1L))
                .thenReturn(expected);

        assertEquals(expected, availabilityService.getForDoctor(1L));
    }

    @Test
    void getForDoctorShouldRejectMissingDoctor() {
        when(doctorRepository.existsById(1L)).thenReturn(false);

        assertThrows(
                ResourceNotFoundException.class,
                () -> availabilityService.getForDoctor(1L)
        );

        verify(availabilityRepository, never())
                .findByDoctorIdAndActiveTrue(anyLong());
    }

    @Test
    void deactivateShouldMarkAvailabilityInactive() {
        DoctorAvailability availability = mock(DoctorAvailability.class);
        when(availabilityRepository.findById(5L))
                .thenReturn(Optional.of(availability));

        availabilityService.deactivate(5L);

        verify(availability).setActive(false);
        verify(availabilityRepository).save(availability);
    }

    @Test
    void deactivateShouldRejectMissingAvailability() {
        when(availabilityRepository.findById(5L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> availabilityService.deactivate(5L)
        );

        verify(availabilityRepository, never()).save(any());
    }
    @Test
void createShouldAllowAdjacentAvailability() {
    Doctor doctor = mock(Doctor.class);
    DoctorAvailability saved = mock(DoctorAvailability.class);

    when(doctorRepository.findById(1L))
            .thenReturn(Optional.of(doctor));

    when(availabilityRepository
            .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                    1L,
                    (short) 1,
                    LocalTime.of(15, 0),
                    LocalTime.of(12, 0)
            ))
            .thenReturn(false);

    when(availabilityRepository.save(any(DoctorAvailability.class)))
            .thenReturn(saved);

    DoctorAvailability result = availabilityService.create(
            1L,
            (short) 1,
            LocalTime.of(12, 0),
            LocalTime.of(15, 0)
    );

    assertSame(saved, result);

    verify(availabilityRepository).save(any(DoctorAvailability.class));
}
}
