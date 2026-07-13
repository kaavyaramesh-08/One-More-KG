package com.onemorekg.repository;

import com.onemorekg.model.FoodNutritionDb;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FoodNutritionDbRepository extends JpaRepository<FoodNutritionDb, Long> {
    Optional<FoodNutritionDb> findByFoodName(String foodName);
    Optional<FoodNutritionDb> findByFoodNameIgnoreCase(String foodName);
    List<FoodNutritionDb> findByFoodNameContainingIgnoreCase(String foodName);
}
