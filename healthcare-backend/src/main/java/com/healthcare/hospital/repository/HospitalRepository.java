
package com.healthcare.hospital.repository;

import com.healthcare.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByRegistrationNumber(String registrationNumber);

    List<Hospital> findByVerifiedTrueAndActiveTrue();

    List<Hospital> findByVerifiedFalseAndActiveTrue();
}
