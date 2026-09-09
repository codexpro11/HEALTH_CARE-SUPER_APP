package com.healthcare.nfc.entity;

import com.healthcare.hospital.entity.Hospital;
import com.healthcare.patient.entity.Patient;
import com.healthcare.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nfc_access_audits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NfcAccessAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nfc_credential_id")
    private NfcCredential nfcCredential;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accessor_user_id", nullable = false)
    private User accessorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "access_type", nullable = false, length = 100)
    private String accessType;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
