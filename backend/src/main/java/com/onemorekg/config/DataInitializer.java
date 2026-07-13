package com.onemorekg.config;

import com.onemorekg.model.FoodNutritionDb;
import com.onemorekg.repository.FoodNutritionDbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private FoodNutritionDbRepository foodRepository;

    @Override
    public void run(String... args) throws Exception {
        if (foodRepository.count() == 0) {
            List<FoodNutritionDb> seedFoods = Arrays.asList(
                new FoodNutritionDb(null, "Paneer Butter Masala", "Indian", 229, 8.0, 6.0, 20.0),
                new FoodNutritionDb(null, "Chicken Tikka Masala", "Indian", 150, 12.0, 5.0, 9.0),
                new FoodNutritionDb(null, "Masala Dosa", "Indian", 168, 3.5, 29.0, 4.5),
                new FoodNutritionDb(null, "Roti / Chapati", "Indian", 297, 10.0, 60.0, 1.0),
                new FoodNutritionDb(null, "Dal Tadka", "Indian", 120, 5.0, 18.0, 3.0),
                new FoodNutritionDb(null, "Chicken Biryani", "Indian", 163, 9.0, 22.0, 4.0),
                new FoodNutritionDb(null, "Idli", "Indian", 115, 2.5, 25.0, 0.3),
                new FoodNutritionDb(null, "Samosa", "Indian", 308, 4.5, 35.0, 17.0),
                new FoodNutritionDb(null, "Aloo Gobi", "Indian", 110, 2.0, 12.0, 6.0),
                new FoodNutritionDb(null, "Gulab Jamun", "Indian", 323, 4.0, 57.0, 9.0),
                new FoodNutritionDb(null, "Chana Masala", "Indian", 130, 5.0, 20.0, 3.0),
                new FoodNutritionDb(null, "Palak Paneer", "Indian", 145, 7.0, 5.0, 11.0),
                new FoodNutritionDb(null, "White Rice", "International", 130, 2.7, 28.0, 0.3),
                new FoodNutritionDb(null, "Butter Naan", "Indian", 310, 8.0, 50.0, 9.0),
                new FoodNutritionDb(null, "Tandoori Chicken", "Indian", 148, 18.0, 2.0, 8.0),
                new FoodNutritionDb(null, "Oats", "International", 389, 16.9, 66.3, 6.9),
                new FoodNutritionDb(null, "Apple", "Fruit", 52, 0.3, 14.0, 0.2),
                new FoodNutritionDb(null, "Egg (Boiled)", "International", 155, 13.0, 1.1, 11.0)
            );
            foodRepository.saveAll(seedFoods);
            System.out.println("Pre-seeded " + seedFoods.size() + " foods into food_nutrition_db.");
        }
    }
}
