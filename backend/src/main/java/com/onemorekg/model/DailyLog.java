package com.onemorekg.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "daily_logs",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "log_date"})}
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "water_ml", nullable = false)
    private int waterMl;

    @Column(name = "calories_in", nullable = false)
    private int caloriesIn;

    @Column(name = "calories_burned", nullable = false)
    private int caloriesBurned;
}
