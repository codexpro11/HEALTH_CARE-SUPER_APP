package com.healthcare.doctor.dto;

import com.healthcare.doctor.entity.Doctor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DoctorResponse(
        Long id,
        Long userId,
        String specialization,
        String licenseNumber,
        String qualifications,
        Integer experienceYears,
        BigDecimal consultationFee,
        Long hospitalId,
        String hospitalName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static DoctorResponse from(Doctor doctor) {
        Long hospitalId = doctor.getHospital() == null ? null : doctor.getHospital().getId();
        String hospitalName = doctor.getHospital() == null ? null : doctor.getHospital().getName();
        return new DoctorResponse(
                doctor.getId(),
                doctor.getUser() == null ? null : doctor.getUser().getId(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getConsultationFee(),
                hospitalId,
                hospitalName,
                doctor.getCreatedAt(),
                doctor.getUpdatedAt());
    }
}