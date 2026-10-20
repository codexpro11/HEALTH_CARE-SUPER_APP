
package com.healthcare.hospital.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.hospital.dto.HospitalResponse;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/hospitals")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHospitalController {

    private final HospitalService hospitalService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getPendingHospitals() {
        List<HospitalResponse> hospitals = hospitalService.getPendingHospitals()
                .stream()
                .map(HospitalResponse::from)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success(hospitals, "Pending hospitals fetched successfully"));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<HospitalResponse>> verify(@PathVariable Long id) {
        Hospital hospital = hospitalService.verify(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HospitalResponse.from(hospital),
                        "Hospital verified successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<HospitalResponse>> deactivate(@PathVariable Long id) {
        Hospital hospital = hospitalService.deactivate(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HospitalResponse.from(hospital),
                        "Hospital deactivated successfully"));
    }
}
