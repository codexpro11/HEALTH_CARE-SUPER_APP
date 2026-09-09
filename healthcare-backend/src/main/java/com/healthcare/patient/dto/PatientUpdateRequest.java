package com.healthcare.patient.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientUpdateRequest {
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
