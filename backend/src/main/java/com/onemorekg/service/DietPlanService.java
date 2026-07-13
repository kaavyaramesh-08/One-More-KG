package com.onemorekg.service;

import com.onemorekg.dto.DietPlanResponse;
import com.onemorekg.model.FoodNutritionDb;
import com.onemorekg.model.Gender;
import com.onemorekg.model.User;
import com.onemorekg.repository.FoodNutritionDbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DietPlanService {

    @Autowired
    private FoodNutritionDbRepository foodRepository;

    public DietPlanResponse calculateDietPlan(User user) {
        // 1. Calculate BMR (Mifflin-St Jeor)
        double bmr;
        if (user.getGender() == Gender.MALE) {
            bmr = 10 * user.getCurrentWeightKg() + 6.25 * user.getHeightCm() - 5 * user.getAge() + 5;
        } else if (user.getGender() == Gender.FEMALE) {
            bmr = 10 * user.getCurrentWeightKg() + 6.25 * user.getHeightCm() - 5 * user.getAge() - 161;
        } else {
            // Midpoint baseline for OTHER
            bmr = 10 * user.getCurrentWeightKg() + 6.25 * user.getHeightCm() - 5 * user.getAge() - 78;
        }

        // 2. Calculate TDEE
        double multiplier = user.getActivityLevel().getMultiplier();
        double tdee = bmr * multiplier;

        // 3. Daily Calorie Target
        int target = (int) (tdee - 500);
        if (target < 1200) {
            target = 1200; // Safe floor for daily caloric intake
        }

        // 4. Macro Splits (40% carbs, 30% protein, 30% fat)
        double carbsPercent = 40.0;
        double proteinPercent = 30.0;
        double fatPercent = 30.0;

        double carbsGrams = Math.round(((target * 0.40) / 4.0) * 10.0) / 10.0;
        double proteinGrams = Math.round(((target * 0.30) / 4.0) * 10.0) / 10.0;
        double fatGrams = Math.round(((target * 0.30) / 9.0) * 10.0) / 10.0;

        // 5. Generate sample day's meals
        List<DietPlanResponse.MealSuggestion> sampleMeals = new ArrayList<>();
        
        // Split target calorie allocation: Breakfast (25%), Lunch (35%), Dinner (30%), Snack (10%)
        addMealSuggestion(sampleMeals, "Breakfast", "Oats", (int) (target * 0.25));
        addMealSuggestion(sampleMeals, "Lunch", "Chicken Biryani", (int) (target * 0.35));
        addMealSuggestion(sampleMeals, "Dinner", "Dal Tadka", (int) (target * 0.30));
        addMealSuggestion(sampleMeals, "Snack", "Apple", (int) (target * 0.10));

        return DietPlanResponse.builder()
                .bmr(Math.round(bmr * 10.0) / 10.0)
                .tdee(Math.round(tdee * 10.0) / 10.0)
                .dailyCalorieTarget(target)
                .carbsPercent(carbsPercent)
                .proteinPercent(proteinPercent)
                .fatPercent(fatPercent)
                .carbsGrams(carbsGrams)
                .proteinGrams(proteinGrams)
                .fatGrams(fatGrams)
                .sampleMeals(sampleMeals)
                .build();
    }

    private void addMealSuggestion(List<DietPlanResponse.MealSuggestion> list, String mealTime, String defaultFoodName, int allocatedCalories) {
        Optional<FoodNutritionDb> foodOpt = foodRepository.findByFoodNameIgnoreCase(defaultFoodName);
        
        FoodNutritionDb food = foodOpt.orElseGet(() -> {
            // Fallback object if seeding hasn't occurred
            int cal = 150;
            if (defaultFoodName.equalsIgnoreCase("Apple")) cal = 52;
            else if (defaultFoodName.equalsIgnoreCase("Oats")) cal = 389;
            return FoodNutritionDb.builder()
                    .foodName(defaultFoodName)
                    .caloriesPer100g(cal)
                    .proteinPer100g(5.0)
                    .carbsPer100g(15.0)
                    .fatPer100g(2.0)
                    .build();
        });

        double quantityGrams = ((double) allocatedCalories / food.getCaloriesPer100g()) * 100.0;
        quantityGrams = Math.round(quantityGrams * 10.0) / 10.0;

        double factor = quantityGrams / 100.0;
        double proteinG = Math.round((food.getProteinPer100g() * factor) * 10.0) / 10.0;
        double carbsG = Math.round((food.getCarbsPer100g() * factor) * 10.0) / 10.0;
        double fatG = Math.round((food.getFatPer100g() * factor) * 10.0) / 10.0;

        list.add(DietPlanResponse.MealSuggestion.builder()
                .mealTime(mealTime)
                .foodName(food.getFoodName())
                .quantityGrams(quantityGrams)
                .calories(allocatedCalories)
                .proteinG(proteinG)
                .carbsG(carbsG)
                .fatG(fatG)
                .build());
    }
}
