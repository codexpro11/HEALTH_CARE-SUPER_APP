package com.healthcare.nfc.repository;

import com.healthcare.nfc.entity.NfcAccessAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NfcAccessAuditRepository extends JpaRepository<NfcAccessAudit, Long> {
}
