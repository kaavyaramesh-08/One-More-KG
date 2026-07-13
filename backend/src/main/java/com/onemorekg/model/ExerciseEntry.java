package com.onemorekg.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "exercise_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "calories_burned", nullable = false)
    private int caloriesBurned;
}
