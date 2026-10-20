
package com.healthcare.user.service;

import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.user.entity.Role;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public User getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found for Firebase UID"));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User getOrCreatePatientForFirebaseLogin(
            String firebaseUid,
            String email,
            String name) {

        Optional<User> existingUser =
                userRepository.findByFirebaseUid(firebaseUid);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Only patient accounts should receive patient profiles.
            if (user.getRole() == Role.PATIENT) {
                ensurePatientProfileExists(user);
            }

            return user;
        }

        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException(
                    "Firebase account must provide an email for registration");
        }

        // Do not silently associate another Firebase identity with
        // an email already owned by a different local account.
        Optional<User> existingEmailUser =
                userRepository.findByEmail(email);

        if (existingEmailUser.isPresent()) {
            throw new IllegalStateException(
                    "An account with this email already exists. "
                            + "Account linking or recovery is required.");
        }

        User newUser = User.builder()
                .firebaseUid(firebaseUid)
                .email(email)
                .fullName(StringUtils.hasText(name) ? name : "New User")
                .role(Role.PATIENT)
                .active(true)
                .build();

        newUser = userRepository.save(newUser);

        // Save the user and patient in the same transaction.
        ensurePatientProfileExists(newUser);

        return newUser;
    }

    private void ensurePatientProfileExists(User user) {
        if (patientRepository.findByUserId(user.getId()).isEmpty()) {
            Patient patient = Patient.builder()
                    .user(user)
                    .build();

            patientRepository.save(patient);
        }
    }
}
