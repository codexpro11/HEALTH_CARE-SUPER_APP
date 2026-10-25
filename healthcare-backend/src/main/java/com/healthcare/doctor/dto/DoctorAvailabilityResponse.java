package com.healthcare.doctor.dto;

import com.healthcare.doctor.entity.DoctorAvailability;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record DoctorAvailabilityResponse(
        Long id,
        Long doctorId,
        Short dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static DoctorAvailabilityResponse from(DoctorAvailability availability) {
        return new DoctorAvailabilityResponse(
                availability.getId(),
                availability.getDoctor().getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.isActive(),
                availability.getCreatedAt(),
                availability.getUpdatedAt());
    }
}