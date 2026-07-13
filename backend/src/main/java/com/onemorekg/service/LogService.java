package com.onemorekg.service;

import com.onemorekg.dto.*;
import com.onemorekg.model.*;
import com.onemorekg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LogService {

    @Autowired
    private FoodEntryRepository foodEntryRepository;

    @Autowired
    private ExerciseEntryRepository exerciseEntryRepository;

    @Autowired
    private WeightLogRepository weightLogRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private FoodNutritionDbRepository foodNutritionDbRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DietPlanService dietPlanService;

    // MET values for standard exercises
    private double getMetValue(String activity) {
        String act = activity.toLowerCase();
        if (act.contains("run")) return 8.0;
        if (act.contains("walk")) return 3.5;
        if (act.contains("cycl") || act.contains("bik")) return 6.0;
        if (act.contains("swim")) return 7.0;
        if (act.contains("yoga")) return 2.5;
        if (act.contains("gym") || act.contains("weight") || act.contains("lift")) return 4.0;
        return 5.0; // default MET
    }

    @Transactional
    public FoodEntry logFood(User user, FoodLogRequest request) {
        // Look up food in DB
        Optional<FoodNutritionDb> foodDbOpt = foodNutritionDbRepository.findByFoodNameIgnoreCase(request.getFoodName());
        
        FoodNutritionDb foodDb;
        if (foodDbOpt.isPresent()) {
            foodDb = foodDbOpt.get();
        } else {
            // Default placeholder if food not found, to prevent crash
            foodDb = FoodNutritionDb.builder()
                    .foodName(request.getFoodName())
                    .cuisineTag("Custom")
                    .caloriesPer100g(150)
                    .proteinPer100g(5.0)
                    .carbsPer100g(15.0)
                    .fatPer100g(8.0)
                    .build();
            foodNutritionDbRepository.save(foodDb);
        }

        double factor = request.getQuantityGrams() / 100.0;
        int calories = (int) (foodDb.getCaloriesPer100g() * factor);
        double protein = foodDb.getProteinPer100g() * factor;
        double carbs = foodDb.getCarbsPer100g() * factor;
        double fat = foodDb.getFatPer100g() * factor;

        FoodEntry foodEntry = FoodEntry.builder()
                .user(user)
                .logDate(request.getLogDate())
                .foodName(foodDb.getFoodName())
                .quantityGrams(request.getQuantityGrams())
                .calories(calories)
                .proteinG(protein)
                .carbsG(carbs)
                .fatG(fat)
                .source(FoodSource.MANUAL)
                .build();

        FoodEntry savedEntry = foodEntryRepository.save(foodEntry);

        // Update daily logs
        updateDailyLogCalorieIn(user, request.getLogDate());

        return savedEntry;
    }

    @Transactional
    public FoodEntry logFoodDirect(User user, FoodEntry foodEntry) {
        foodEntry.setUser(user);
        FoodEntry saved = foodEntryRepository.save(foodEntry);
        updateDailyLogCalorieIn(user, foodEntry.getLogDate());
        return saved;
    }

    @Transactional
    public DailyLog logWater(User user, WaterLogRequest request) {
        DailyLog dailyLog = getOrCreateDailyLog(user, request.getLogDate());
        dailyLog.setWaterMl(dailyLog.getWaterMl() + request.getWaterMl());
        return dailyLogRepository.save(dailyLog);
    }

    @Transactional
    public ExerciseEntry logExercise(User user, ExerciseLogRequest request) {
        double met = getMetValue(request.getActivityType());
        // MET formula: Calories burned = MET * Weight (kg) * Time (hours)
        double weight = user.getCurrentWeightKg();
        double hours = request.getDurationMinutes() / 60.0;
        int caloriesBurned = (int) (met * weight * hours);

        ExerciseEntry exerciseEntry = ExerciseEntry.builder()
                .user(user)
                .logDate(request.getLogDate())
                .activityType(request.getActivityType())
                .durationMinutes(request.getDurationMinutes())
                .caloriesBurned(caloriesBurned)
                .build();

        ExerciseEntry saved = exerciseEntryRepository.save(exerciseEntry);

        updateDailyLogCalorieBurned(user, request.getLogDate());

        return saved;
    }

    @Transactional
    public WeightLog logWeight(User user, WeightLogRequest request) {
        Optional<WeightLog> existingOpt = weightLogRepository.findByUserAndLoggedDate(user, request.getLogDate());
        WeightLog weightLog;
        if (existingOpt.isPresent()) {
            weightLog = existingOpt.get();
            weightLog.setWeightKg(request.getWeightKg());
        } else {
            weightLog = WeightLog.builder()
                    .user(user)
                    .loggedDate(request.getLogDate())
                    .weightKg(request.getWeightKg())
                    .build();
        }
        WeightLog saved = weightLogRepository.save(weightLog);

        // Sync back to user profile if it's the latest log or current date
        // For simplicity, we update the user's current weight to their latest logged weight
        user.setCurrentWeightKg(request.getWeightKg());
        userRepository.save(user);

        return saved;
    }

    public List<WeightLog> getWeightHistory(User user) {
        return weightLogRepository.findByUserOrderByLoggedDateAsc(user);
    }

    public DailySummaryResponse getDailySummary(User user, LocalDate date) {
        DailyLog dailyLog = getOrCreateDailyLog(user, date);
        List<FoodEntry> foods = foodEntryRepository.findByUserAndLogDate(user, date);
        List<ExerciseEntry> exercises = exerciseEntryRepository.findByUserAndLogDate(user, date);
        int target = dietPlanService.calculateDietPlan(user).getDailyCalorieTarget();

        return DailySummaryResponse.builder()
                .logDate(date)
                .waterMl(dailyLog.getWaterMl())
                .caloriesIn(dailyLog.getCaloriesIn())
                .caloriesBurned(dailyLog.getCaloriesBurned())
                .dailyCalorieTarget(target)
                .foodEntries(foods)
                .exerciseEntries(exercises)
                .build();
    }

    private DailyLog getOrCreateDailyLog(User user, LocalDate date) {
        return dailyLogRepository.findByUserAndLogDate(user, date)
                .orElseGet(() -> {
                    DailyLog newLog = DailyLog.builder()
                            .user(user)
                            .logDate(date)
                            .waterMl(0)
                            .caloriesIn(0)
                            .caloriesBurned(0)
                            .build();
                    return dailyLogRepository.save(newLog);
                });
    }

    private void updateDailyLogCalorieIn(User user, LocalDate date) {
        DailyLog dailyLog = getOrCreateDailyLog(user, date);
        List<FoodEntry> foods = foodEntryRepository.findByUserAndLogDate(user, date);
        int totalCal = foods.stream().mapToInt(FoodEntry::getCalories).sum();
        dailyLog.setCaloriesIn(totalCal);
        dailyLogRepository.save(dailyLog);
    }

    private void updateDailyLogCalorieBurned(User user, LocalDate date) {
        DailyLog dailyLog = getOrCreateDailyLog(user, date);
        List<ExerciseEntry> exercises = exerciseEntryRepository.findByUserAndLogDate(user, date);
        int totalBurned = exercises.stream().mapToInt(ExerciseEntry::getCaloriesBurned).sum();
        dailyLog.setCaloriesBurned(totalBurned);
        dailyLogRepository.save(dailyLog);
    }
}
