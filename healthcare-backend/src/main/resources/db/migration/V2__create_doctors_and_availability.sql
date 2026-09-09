CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    specialization VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    qualifications TEXT,
    experience_years INT,
    consultation_fee DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
