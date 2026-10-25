package com.healthcare.consent.repository;

import com.healthcare.consent.entity.Consent;
import com.healthcare.consent.entity.ConsentScope;
import com.healthcare.consent.entity.ConsentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findByPatient_IdAndStatusAndScope(
        Long patientId, ConsentStatus status, ConsentScope scope
    );
}
