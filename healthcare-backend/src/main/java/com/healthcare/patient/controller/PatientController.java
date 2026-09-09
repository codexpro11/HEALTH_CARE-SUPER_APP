package com.healthcare.patient.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.patient.dto.PatientUpdateRequest;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.service.PatientService;
import com.healthcare.security.principal.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Patient>> getCurrentPatient(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        Patient patient = patientService.getPatientByUserId(authenticatedUser.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient profile fetched successfully"));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<Patient>> updateCurrentPatient(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                                     @RequestBody PatientUpdateRequest request) {
        Patient updatedPatient = patientService.createOrUpdatePatient(authenticatedUser.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success(updatedPatient, "Patient profile updated successfully"));
    }
}
