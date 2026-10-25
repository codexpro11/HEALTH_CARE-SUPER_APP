package com.healthcare.doctor.controller;

import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.doctor.dto.DoctorAvailabilityRequest;
import com.healthcare.doctor.dto.DoctorAvailabilityResponse;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorAvailabilityRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.doctor.service.DoctorAvailabilityService;
import com.healthcare.security.principal.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor/availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    @PostMapping
    public DoctorAvailabilityResponse create(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody DoctorAvailabilityRequest request) {
        Doctor doctor = getDoctorForUser(principal.getUser().getId());
        return DoctorAvailabilityResponse.from(availabilityService.create(
                doctor.getId(), request.dayOfWeek(), request.startTime(), request.endTime()));
    }

    @GetMapping
    public List<DoctorAvailabilityResponse> getOwnAvailability(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        Doctor doctor = getDoctorForUser(principal.getUser().getId());
        return availabilityService.getForDoctor(doctor.getId()).stream()
                .map(DoctorAvailabilityResponse::from)
                .toList();
    }

    @PatchMapping("/{availabilityId}/deactivate")
    public void deactivate(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable Long availabilityId) {
        Long userId = principal.getUser().getId();
        if (!availabilityRepository.existsByIdAndDoctor_User_Id(availabilityId, userId)) {
            throw new ResourceNotFoundException("Availability not found: " + availabilityId);
        }
        availabilityService.deactivate(availabilityId);
    }

    private Doctor getDoctorForUser(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user: " + userId));
    }
}