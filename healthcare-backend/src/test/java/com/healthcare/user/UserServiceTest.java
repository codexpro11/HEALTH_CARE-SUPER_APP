package com.healthcare.user;

import com.healthcare.user.entity.Role;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;
import com.healthcare.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .firebaseUid("firebase-uid")
                .email("test@test.com")
                .fullName("Test User")
                .role(Role.PATIENT)
                .build();
    }

    @Test
    void testFindByFirebaseUid() {
        when(userRepository.findByFirebaseUid(anyString())).thenReturn(Optional.of(user));

        Optional<User> foundUser = userService.findByFirebaseUid("firebase-uid");

        assertNotNull(foundUser);
        assertEquals("test@test.com", foundUser.get().getEmail());
    }
}
