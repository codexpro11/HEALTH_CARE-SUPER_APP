package com.healthcare.hospital.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserHospitalId implements Serializable {

    private Long userId;
    private Long hospitalId;
}