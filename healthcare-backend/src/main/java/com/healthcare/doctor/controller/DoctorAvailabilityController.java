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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor/availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    /**
     * Creates availability for the authenticated doctor.
     */
    @PostMapping
    public DoctorAvailabilityResponse create(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody DoctorAvailabilityRequest request) {

        Doctor doctor = getDoctorForUser(principal.getUser().getId());

        return DoctorAvailabilityResponse.from(
                availabilityService.create(
                        doctor.getId(),
                        request.dayOfWeek(),
                        request.startTime(),
                        request.endTime()
                )
        );
    }

    /**
     * Retrieves availability belonging to the authenticated doctor.
     */
    @GetMapping
    public List<DoctorAvailabilityResponse> getOwnAvailability(
            @AuthenticationPrincipal AuthenticatedUser principal) {

        Doctor doctor = getDoctorForUser(principal.getUser().getId());

        return availabilityService.getForDoctor(doctor.getId())
                .stream()
                .map(DoctorAvailabilityResponse::from)
                .toList();
    }

    /**
     * Deactivates an availability schedule only if it belongs
     * to the authenticated doctor.
     */
    @PatchMapping("/{availabilityId}/deactivate")
    public void deactivate(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable Long availabilityId) {

        Long userId = principal.getUser().getId();

        boolean belongsToUser =
                availabilityRepository.existsByIdAndDoctor_User_Id(
                        availabilityId,
                        userId
                );

        if (!belongsToUser) {
            throw new ResourceNotFoundException(
                    "Availability not found: " + availabilityId
            );
        }

        availabilityService.deactivate(availabilityId);
    }

    /**
     * Finds the doctor profile associated with the authenticated user.
     */
    private Doctor getDoctorForUser(Long userId) {

        return doctorRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Doctor profile not found for user: " + userId
                        )
                );
    }
}