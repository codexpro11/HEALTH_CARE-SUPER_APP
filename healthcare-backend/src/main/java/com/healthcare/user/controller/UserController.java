package com.healthcare.user.controller;

import com.healthcare.common.response.ApiResponse;
import com.healthcare.security.principal.AuthenticatedUser;
import com.healthcare.user.dto.UserUpdateRequest;
import com.healthcare.user.entity.User;
import com.healthcare.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return ResponseEntity.ok(ApiResponse.success(authenticatedUser.getUser(), "User fetched successfully"));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                               @RequestBody UserUpdateRequest request) {
        User user = authenticatedUser.getUser();
        
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        
        User updatedUser = userService.saveUser(user);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }
}
