package com.healthcare.doctor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record DoctorRegistrationRequest(
        @NotNull Long hospitalId,
        @NotBlank String specialization,
        String licenseNumber,
        String qualifications,
        @PositiveOrZero Integer experienceYears,
        @DecimalMin("0.0") BigDecimal consultationFee) {
}