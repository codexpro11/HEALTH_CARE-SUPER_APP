package com.healthcare.patient.service;

import com.healthcare.common.exception.ResourceNotFoundException;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Optional<Patient> findByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));
    }

    public Patient createOrUpdatePatient(User user, com.healthcare.patient.dto.PatientUpdateRequest updatedData) {
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseGet(() -> Patient.builder().user(user).build());

        if (updatedData.getDateOfBirth() != null) patient.setDateOfBirth(updatedData.getDateOfBirth());
        if (updatedData.getGender() != null) patient.setGender(updatedData.getGender());
        if (updatedData.getBloodGroup() != null) patient.setBloodGroup(updatedData.getBloodGroup());
        if (updatedData.getAddress() != null) patient.setAddress(updatedData.getAddress());
        if (updatedData.getEmergencyContactName() != null) patient.setEmergencyContactName(updatedData.getEmergencyContactName());
        if (updatedData.getEmergencyContactPhone() != null) patient.setEmergencyContactPhone(updatedData.getEmergencyContactPhone());

        return patientRepository.save(patient);
    }
}
