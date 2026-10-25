package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorAvailabilityRepository
        extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorIdAndActiveTrue(Long doctorId);
    boolean existsByIdAndDoctor_User_Id(Long id, Long userId);
}
