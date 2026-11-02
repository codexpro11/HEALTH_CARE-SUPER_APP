package com.healthcare.doctor.service;

import com.healthcare.common.exception.BadRequestException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorAvailability;
import com.healthcare.doctor.repository.DoctorAvailabilityRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Creates a recurring weekly availability schedule for a doctor.
     *
     * @param doctorId  ID of the doctor
     * @param dayOfWeek Day of week (1 = Monday, 7 = Sunday)
     * @param startTime Availability start time
     * @param endTime   Availability end time
     * @return Saved availability
     */
    @Transactional
    public DoctorAvailability create(
            Long doctorId,
            Short dayOfWeek,
            LocalTime startTime,
            LocalTime endTime) {

        // Validate weekday
        if (dayOfWeek == null || dayOfWeek < 1 || dayOfWeek > 7) {
            throw new BadRequestException(
                    "dayOfWeek must be between 1 (Monday) and 7 (Sunday)"
            );
        }

        // Validate time range
        if (startTime == null || endTime == null
                || !startTime.isBefore(endTime)) {
            throw new BadRequestException(
                    "startTime must be earlier than endTime"
            );
        }

        // Verify that the doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor not found: " + doctorId
                        )
                );

        // Prevent overlapping availability on the same day
        boolean hasOverlap = availabilityRepository
                .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                        doctorId,
                        dayOfWeek,
                        endTime,
                        startTime
                );

        if (hasOverlap) {
            throw new BadRequestException(
                    "Doctor already has overlapping availability for this day"
            );
        }

        // Build and save availability
        DoctorAvailability availability = DoctorAvailability.builder()
                .doctor(doctor)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .active(true)
                .build();

        return availabilityRepository.save(availability);
    }

    /**
     * Retrieves all active availability schedules for a doctor.
     *
     * @param doctorId ID of the doctor
     * @return List of active availability schedules
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getForDoctor(Long doctorId) {

        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException(
                    "Doctor not found: " + doctorId
            );
        }

        return availabilityRepository.findByDoctorIdAndActiveTrue(doctorId);
    }

    /**
     * Deactivates an availability schedule.
     *
     * @param availabilityId ID of the availability schedule
     */
    @Transactional
    public void deactivate(Long availabilityId) {

        DoctorAvailability availability = availabilityRepository
                .findById(availabilityId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Availability not found: " + availabilityId
                        )
                );

        availability.setActive(false);

        availabilityRepository.save(availability);
    }
}