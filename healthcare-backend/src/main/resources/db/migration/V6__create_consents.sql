CREATE TABLE consents (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    provider_user_id BIGINT REFERENCES users(id),
    hospital_id BIGINT REFERENCES hospitals(id),
    scope VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
