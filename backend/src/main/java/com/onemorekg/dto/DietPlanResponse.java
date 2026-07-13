package com.onemorekg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietPlanResponse {
    private double bmr;
    private double tdee;
    private int dailyCalorieTarget;
    
    // Macro percentage splits
    private double carbsPercent;
    private double proteinPercent;
    private double fatPercent;

    // Macro target grams
    private double carbsGrams;
    private double proteinGrams;
    private double fatGrams;

    private List<MealSuggestion> sampleMeals;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MealSuggestion {
        private String mealTime; // Breakfast, Lunch, Dinner, Snack
        private String foodName;
        private double quantityGrams;
        private int calories;
        private double proteinG;
        private double carbsG;
        private double fatG;
    }
}
