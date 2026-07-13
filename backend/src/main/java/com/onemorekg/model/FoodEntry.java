package com.onemorekg.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "food_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(name = "quantity_grams", nullable = false)
    private double quantityGrams;

    @Column(nullable = false)
    private int calories;

    @Column(name = "protein_g", nullable = false)
    private double proteinG;

    @Column(name = "carbs_g", nullable = false)
    private double carbsG;

    @Column(name = "fat_g", nullable = false)
    private double fatG;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodSource source;
}
