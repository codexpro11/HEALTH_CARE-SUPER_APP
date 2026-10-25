package com.healthcare.doctor.controller;

import com.healthcare.doctor.dto.DoctorRegistrationRequest;
import com.healthcare.doctor.dto.DoctorResponse;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.service.DoctorService;
import com.healthcare.security.principal.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/profile")
    public DoctorResponse registerProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody DoctorRegistrationRequest request) {
        Doctor details = Doctor.builder()
                .specialization(request.specialization())
                .licenseNumber(request.licenseNumber())
                .qualifications(request.qualifications())
                .experienceYears(request.experienceYears())
                .consultationFee(request.consultationFee())
                .build();
        return DoctorResponse.from(doctorService.register(
                principal.getUser().getId(), request.hospitalId(), details));
    }

    @GetMapping("/profile")
    public DoctorResponse getOwnProfile(@AuthenticationPrincipal AuthenticatedUser principal) {
        return DoctorResponse.from(doctorService.getByUserId(principal.getUser().getId()));
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<DoctorResponse> getByHospital(@PathVariable Long hospitalId) {
        return doctorService.getByHospital(hospitalId).stream()
                .map(DoctorResponse::from)
                .toList();
    }
}