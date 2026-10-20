
package com.healthcare.hospital.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.hospital.dto.HospitalRegistrationRequest;
import com.healthcare.hospital.dto.HospitalResponse;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    public ResponseEntity<ApiResponse<HospitalResponse>> register(
            @Valid @RequestBody HospitalRegistrationRequest request) {

        Hospital hospital = Hospital.builder()
                .name(request.getName().trim())
                .registrationNumber(normalize(request.getRegistrationNumber()))
                .address(request.getAddress().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .phone(normalize(request.getPhone()))
                .build();

        Hospital registered = hospitalService.register(hospital);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        HospitalResponse.from(registered),
                        "Hospital registered and awaiting verification"));
    }

    @GetMapping("/verified")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getVerifiedHospitals() {
        List<HospitalResponse> hospitals = hospitalService.getVerifiedHospitals()
                .stream()
                .map(HospitalResponse::from)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success(hospitals, "Verified hospitals fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getById(@PathVariable Long id) {
        Hospital hospital = hospitalService.getById(id);

        return ResponseEntity.ok(
                ApiResponse.success(HospitalResponse.from(hospital),
                        "Hospital fetched successfully"));
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
