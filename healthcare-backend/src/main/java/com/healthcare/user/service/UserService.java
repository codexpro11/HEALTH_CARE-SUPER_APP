package com.healthcare.user.service;

import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public User getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for Firebase UID"));
    }
    
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
