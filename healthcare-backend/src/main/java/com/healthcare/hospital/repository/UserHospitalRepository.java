package com.healthcare.hospital.repository;

import com.healthcare.hospital.entity.UserHospital;
import com.healthcare.hospital.entity.UserHospitalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserHospitalRepository
        extends JpaRepository<UserHospital, UserHospitalId> {

    boolean existsByUserIdAndHospitalId(
            Long userId,
            Long hospitalId
    );
}