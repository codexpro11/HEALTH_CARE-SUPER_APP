package com.healthcare.hospital.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_hospitals")
@IdClass(UserHospitalId.class)
@Getter
@Setter
@NoArgsConstructor
public class UserHospital {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
}