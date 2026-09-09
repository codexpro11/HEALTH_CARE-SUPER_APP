package com.healthcare.user.controller;

import com.healthcare.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TestController {

    @GetMapping("/admin/test")
    public ResponseEntity<ApiResponse<String>> adminTest() {
        return ResponseEntity.ok(ApiResponse.success("Admin access verified", "Success"));
    }

    @GetMapping("/doctor/test")
    public ResponseEntity<ApiResponse<String>> doctorTest() {
        return ResponseEntity.ok(ApiResponse.success("Doctor access verified", "Success"));
    }

    @GetMapping("/patient/test")
    public ResponseEntity<ApiResponse<String>> patientTest() {
        return ResponseEntity.ok(ApiResponse.success("Patient access verified", "Success"));
    }
}
