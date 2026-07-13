package com.onemorekg.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_nutrition_db")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodNutritionDb {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "food_name", nullable = false, unique = true)
    private String foodName;

    @Column(name = "cuisine_tag")
    private String cuisineTag;

    @Column(name = "calories_per_100g", nullable = false)
    private int caloriesPer100g;

    @Column(name = "protein_per_100g", nullable = false)
    private double proteinPer100g;

    @Column(name = "carbs_per_100g", nullable = false)
    private double carbsPer100g;

    @Column(name = "fat_per_100g", nullable = false)
    private double fatPer100g;
}
