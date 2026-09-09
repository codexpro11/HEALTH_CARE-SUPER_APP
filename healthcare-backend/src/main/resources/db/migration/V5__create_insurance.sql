CREATE TABLE insurance_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    phone VARCHAR(50),
    website VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    provider_id BIGINT NOT NULL REFERENCES insurance_providers(id),
    policy_number VARCHAR(100) NOT NULL,
    member_id VARCHAR(100),
    plan_name VARCHAR(255),
    policy_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL,
    sum_insured DECIMAL(15, 2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (provider_id, policy_number)
);

CREATE TABLE insurance_coverages (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES insurance_policies(id),
    coverage_type VARCHAR(100) NOT NULL,
    coverage_limit DECIMAL(15, 2),
    deductible DECIMAL(15, 2),
    co_pay DECIMAL(15, 2),
    description TEXT
);

CREATE TABLE insurance_claims (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES insurance_policies(id),
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    claim_amount DECIMAL(15, 2) NOT NULL,
    approved_amount DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
