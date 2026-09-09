CREATE TABLE nfc_credentials (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    credential_id VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
