CREATE TABLE nfc_access_audits (
    id BIGSERIAL PRIMARY KEY,
    nfc_credential_id BIGINT REFERENCES nfc_credentials(id),
    patient_id BIGINT REFERENCES patients(id),
    accessor_user_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    access_type VARCHAR(100) NOT NULL,
    purpose TEXT,
    timestamp TIMESTAMP NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    ip_address VARCHAR(50)
);
