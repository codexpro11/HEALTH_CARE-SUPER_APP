package com.healthcare.doctor.repository;

import com.healthcare.config.JpaAuditingConfig;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorAvailability;
import com.healthcare.user.entity.Role;
import com.healthcare.user.entity.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Import(JpaAuditingConfig.class)
class DoctorAvailabilityRepositoryIntegrationTest {

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private EntityManager entityManager;

    private Long doctorId;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .firebaseUid("test-doctor-uid")
                .email("testdoctor@example.com")
                .fullName("Test Doctor")
                .role(Role.DOCTOR)
                .active(true)
                .build();

        entityManager.persist(user);
        entityManager.flush();

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization("Cardiology")
                .licenseNumber("TEST-LICENSE-001")
                .experienceYears(5)
                .build();

        entityManager.persist(doctor);
        entityManager.flush();

        doctorId = doctor.getId();

        DoctorAvailability existingAvailability =
                DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek((short) 1)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(12, 0))
                        .active(true)
                        .build();

        entityManager.persist(existingAvailability);
        entityManager.flush();
    }

    @Test
    void shouldDetectOverlappingAvailability() {

        boolean result = availabilityRepository
                .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                        doctorId,
                        (short) 1,
                        LocalTime.of(14, 0),
                        LocalTime.of(11, 0)
                );

        assertTrue(result);
    }

    @Test
    void shouldAllowAdjacentAvailability() {

        boolean result = availabilityRepository
                .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                        doctorId,
                        (short) 1,
                        LocalTime.of(15, 0),
                        LocalTime.of(12, 0)
                );

        assertFalse(result);
    }

    @Test
    void shouldIgnoreAvailabilityOnDifferentDay() {

        boolean result = availabilityRepository
                .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                        doctorId,
                        (short) 2,
                        LocalTime.of(14, 0),
                        LocalTime.of(11, 0)
                );

        assertFalse(result);
    }
    @Test
void shouldIgnoreInactiveAvailability() {

    DoctorAvailability existing = availabilityRepository
            .findByDoctorIdAndActiveTrue(doctorId)
            .get(0);

    existing.setActive(false);
    availabilityRepository.saveAndFlush(existing);

    boolean result = availabilityRepository
            .existsByDoctorIdAndDayOfWeekAndActiveTrueAndStartTimeLessThanAndEndTimeGreaterThan(
                    doctorId,
                    (short) 1,
                    LocalTime.of(14, 0),
                    LocalTime.of(11, 0)
            );

    assertFalse(result);
}
}