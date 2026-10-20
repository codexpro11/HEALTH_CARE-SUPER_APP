
package com.healthcare.hospital.dto;

import com.healthcare.hospital.entity.Hospital;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HospitalResponse {

    private Long id;
    private String name;
    private String registrationNumber;
    private String address;
    private String city;
    private String state;
    private String phone;
    private boolean verified;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static HospitalResponse from(Hospital hospital) {
        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .registrationNumber(hospital.getRegistrationNumber())
                .address(hospital.getAddress())
                .city(hospital.getCity())
                .state(hospital.getState())
                .phone(hospital.getPhone())
                .verified(hospital.isVerified())
                .active(hospital.isActive())
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }
}

