package com.healthcare.hospital.service;

import com.healthcare.common.exception.ConflictException;
import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.hospital.entity.Hospital;
import com.healthcare.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    @Transactional
    public Hospital register(Hospital hospital) {
        if (hospital.getRegistrationNumber() != null
                && hospitalRepository.findByRegistrationNumber(
                        hospital.getRegistrationNumber()).isPresent()) {
            throw new ConflictException("Hospital registration number already exists");
        }

        hospital.setVerified(false);
        hospital.setActive(true);
        return hospitalRepository.save(hospital);
    }

    @Transactional(readOnly = true)
    public Hospital getById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hospital not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Hospital> getVerifiedHospitals() {
        return hospitalRepository.findByVerifiedTrueAndActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Hospital> getPendingHospitals() {
        return hospitalRepository.findByVerifiedFalseAndActiveTrue();
    }

    @Transactional
    public Hospital verify(Long id) {
        Hospital hospital = getById(id);
        hospital.setVerified(true);
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public Hospital deactivate(Long id) {
        Hospital hospital = getById(id);
        hospital.setActive(false);
        return hospitalRepository.save(hospital);
    }
}