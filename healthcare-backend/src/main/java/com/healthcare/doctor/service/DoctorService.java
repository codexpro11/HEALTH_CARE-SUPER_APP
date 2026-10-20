package com.healthcare.doctor.service;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.repository.HospitalRepository;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    @Transactional
    public Doctor register(Long userId, Long hospitalId, Doctor details) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userId));

        if (doctorRepository.findByUserId(userId).isPresent()) {
            throw new ConflictException("User already has a doctor profile");
        }

        if (details.getLicenseNumber() != null
                && doctorRepository.findByLicenseNumber(
                        details.getLicenseNumber()).isPresent()) {
            throw new ConflictException("Doctor license number already exists");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found: " + hospitalId));

        if (!hospital.isActive() || !hospital.isVerified()) {
            throw new ConflictException(
                    "Doctor can only register with an active, verified hospital");
        }

        details.setId(null);
        details.setUser(user);
        details.setHospital(hospital);

        return doctorRepository.save(details);
    }

    @Transactional(readOnly = true)
    public Doctor getById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Doctor> getByHospital(Long hospitalId) {
        if (!hospitalRepository.existsById(hospitalId)) {
            throw new ResourceNotFoundException("Hospital not found: " + hospitalId);
        }
        return doctorRepository.findByHospitalId(hospitalId);
    }
}