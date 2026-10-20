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

    @Transactional
    public DoctorAvailability create(
            Long doctorId,
            Short dayOfWeek,
            LocalTime startTime,
            LocalTime endTime) {

        if (dayOfWeek == null || dayOfWeek < 1 || dayOfWeek > 7) {
            throw new BadRequestException(
                    "dayOfWeek must be between 1 (Monday) and 7 (Sunday)");
        }

        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new BadRequestException(
                    "startTime must be earlier than endTime");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found: " + doctorId));

        DoctorAvailability availability = DoctorAvailability.builder()
                .doctor(doctor)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .active(true)
                .build();

        return availabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailability> getForDoctor(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found: " + doctorId);
        }

        return availabilityRepository.findByDoctorIdAndActiveTrue(doctorId);
    }

    @Transactional
    public void deactivate(Long availabilityId) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Availability not found: " + availabilityId));

        availability.setActive(false);
        availabilityRepository.save(availability);
    }
}