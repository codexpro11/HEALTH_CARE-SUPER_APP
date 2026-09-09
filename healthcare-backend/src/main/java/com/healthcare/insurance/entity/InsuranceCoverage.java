package com.healthcare.insurance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "insurance_coverages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCoverage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private InsurancePolicy policy;

    @Column(name = "coverage_type", nullable = false, length = 100)
    private String coverageType;

    @Column(name = "coverage_limit", precision = 15, scale = 2)
    private BigDecimal coverageLimit;

    @Column(precision = 15, scale = 2)
    private BigDecimal deductible;

    @Column(name = "co_pay", precision = 15, scale = 2)
    private BigDecimal coPay;

    @Column(columnDefinition = "TEXT")
    private String description;
}
