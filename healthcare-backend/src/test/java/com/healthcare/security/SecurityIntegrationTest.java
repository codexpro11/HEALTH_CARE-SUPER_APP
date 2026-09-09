package com.healthcare.security;

import com.google.firebase.auth.FirebaseToken;
import com.healthcare.security.firebase.FirebaseTokenVerifier;
import com.healthcare.user.entity.Role;
import com.healthcare.user.entity.User;
import com.healthcare.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FirebaseTokenVerifier firebaseTokenVerifier;

    @MockBean
    private UserService userService;

    private FirebaseToken mockFirebaseToken;
    private User patientUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        mockFirebaseToken = mock(FirebaseToken.class);
        
        patientUser = User.builder()
                .id(1L)
                .firebaseUid("patient-uid")
                .email("patient@test.com")
                .fullName("Patient User")
                .role(Role.PATIENT)
                .active(true)
                .build();

        adminUser = User.builder()
                .id(2L)
                .firebaseUid("admin-uid")
                .email("admin@test.com")
                .fullName("Admin User")
                .role(Role.ADMIN)
                .active(true)
                .build();
    }

    @Test
    void testMissingToken_ShouldReturnUnauthorized_ExceptPermitted() throws Exception {
        // Protected endpoint without token -> 401 or 403 (Spring defaults to 403 on missing auth, but lets check)
        mockMvc.perform(get("/api/v1/patient/test"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testInvalidToken_ShouldReturnUnauthorized() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(get("/api/v1/patient/test")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden()); // Because context is not set
    }

    @Test
    void testUnknownUser_ShouldCreatePatientAndSucceed() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenReturn(mockFirebaseToken);
        when(mockFirebaseToken.getUid()).thenReturn("unknown-uid");
        when(mockFirebaseToken.getEmail()).thenReturn("new@test.com");
        when(mockFirebaseToken.getName()).thenReturn("New User");
        when(userService.findByFirebaseUid("unknown-uid")).thenReturn(Optional.empty());

        User newUser = User.builder()
                .id(3L)
                .firebaseUid("unknown-uid")
                .email("new@test.com")
                .fullName("New User")
                .role(Role.PATIENT)
                .active(true)
                .build();
        when(userService.saveUser(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(newUser);

        mockMvc.perform(get("/api/v1/patient/test")
                        .header("Authorization", "Bearer valid-but-unknown-token"))
                .andExpect(status().isOk());
    }

    @Test
    void testPatientAccessingPatientEndpoint_ShouldSucceed() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenReturn(mockFirebaseToken);
        when(mockFirebaseToken.getUid()).thenReturn("patient-uid");
        when(userService.findByFirebaseUid("patient-uid")).thenReturn(Optional.of(patientUser));

        mockMvc.perform(get("/api/v1/patient/test")
                        .header("Authorization", "Bearer patient-token"))
                .andExpect(status().isOk());
    }

    @Test
    void testPatientAccessingDoctorEndpoint_ShouldReturnForbidden() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenReturn(mockFirebaseToken);
        when(mockFirebaseToken.getUid()).thenReturn("patient-uid");
        when(userService.findByFirebaseUid("patient-uid")).thenReturn(Optional.of(patientUser));

        mockMvc.perform(get("/api/v1/doctor/test")
                        .header("Authorization", "Bearer patient-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPatientAccessingAdminEndpoint_ShouldReturnForbidden() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenReturn(mockFirebaseToken);
        when(mockFirebaseToken.getUid()).thenReturn("patient-uid");
        when(userService.findByFirebaseUid("patient-uid")).thenReturn(Optional.of(patientUser));

        mockMvc.perform(get("/api/v1/admin/test")
                        .header("Authorization", "Bearer patient-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminAccessingAdminEndpoint_ShouldSucceed() throws Exception {
        when(firebaseTokenVerifier.verifyToken(anyString())).thenReturn(mockFirebaseToken);
        when(mockFirebaseToken.getUid()).thenReturn("admin-uid");
        when(userService.findByFirebaseUid("admin-uid")).thenReturn(Optional.of(adminUser));

        mockMvc.perform(get("/api/v1/admin/test")
                        .header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }
}
