-- Link doctors to hospitals.
-- Nullable initially to avoid breaking any existing doctor records.
ALTER TABLE doctors
    ADD COLUMN hospital_id BIGINT REFERENCES hospitals(id);

CREATE INDEX idx_doctors_hospital_id
    ON doctors(hospital_id);

-- Recurring weekly availability, not individual appointment slots.
CREATE TABLE doctor_availability (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_availability_time
        CHECK (start_time < end_time)
);

CREATE INDEX idx_doctor_availability_doctor_day
    ON doctor_availability(doctor_id, day_of_week);