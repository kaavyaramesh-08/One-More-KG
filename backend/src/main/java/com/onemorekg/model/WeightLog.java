package com.onemorekg.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "weight_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeightLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weight_kg", nullable = false)
    private double weightKg;

    @Column(name = "logged_date", nullable = false)
    private LocalDate loggedDate;
}
