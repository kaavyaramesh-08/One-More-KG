package com.onemorekg.controller;

import com.onemorekg.dto.*;
import com.onemorekg.model.*;
import com.onemorekg.security.UserPrincipal;
import com.onemorekg.service.LogService;
import com.onemorekg.service.UserService;
import com.onemorekg.repository.FoodNutritionDbRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @Autowired
    private UserService userService;

    @Autowired
    private FoodNutritionDbRepository foodNutritionDbRepository;

    @GetMapping("/food/search")
    public ResponseEntity<List<FoodNutritionDb>> searchFood(@RequestParam("query") String query) {
        return ResponseEntity.ok(foodNutritionDbRepository.findByFoodNameContainingIgnoreCase(query));
    }

    @PostMapping("/food")
    public ResponseEntity<FoodEntry> logFood(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody FoodLogRequest request) {
        User user = userService.findById(currentUser.getId());
        FoodEntry entry = logService.logFood(user, request);
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/water")
    public ResponseEntity<DailyLog> logWater(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody WaterLogRequest request) {
        User user = userService.findById(currentUser.getId());
        DailyLog log = logService.logWater(user, request);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/exercise")
    public ResponseEntity<ExerciseEntry> logExercise(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ExerciseLogRequest request) {
        User user = userService.findById(currentUser.getId());
        ExerciseEntry entry = logService.logExercise(user, request);
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/weight")
    public ResponseEntity<WeightLog> logWeight(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody WeightLogRequest request) {
        User user = userService.findById(currentUser.getId());
        WeightLog entry = logService.logWeight(user, request);
        return ResponseEntity.ok(entry);
    }

    @GetMapping("/weight/history")
    public ResponseEntity<List<WeightLog>> getWeightHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        List<WeightLog> history = logService.getWeightHistory(user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/daily")
    public ResponseEntity<DailySummaryResponse> getDailySummary(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = userService.findById(currentUser.getId());
        DailySummaryResponse summary = logService.getDailySummary(user, date);
        return ResponseEntity.ok(summary);
    }
}
