package com.healthcare.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String phone;
    private String profileImageUrl;
}
