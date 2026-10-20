
package com.healthcare.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HospitalRegistrationRequest {

    @NotBlank(message = "Hospital name is required")
    @Size(max = 255, message = "Hospital name must not exceed 255 characters")
    private String name;

    @Size(max = 255, message = "Registration number must not exceed 255 characters")
    private String registrationNumber;

    @NotBlank(message = "Hospital address is required")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 255, message = "City must not exceed 255 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 255, message = "State must not exceed 255 characters")
    private String state;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;
}
