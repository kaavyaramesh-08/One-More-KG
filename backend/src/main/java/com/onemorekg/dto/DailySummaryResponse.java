package com.onemorekg.dto;

import com.onemorekg.model.ExerciseEntry;
import com.onemorekg.model.FoodEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummaryResponse {
    private LocalDate logDate;
    private int waterMl;
    private int caloriesIn;
    private int caloriesBurned;
    private int dailyCalorieTarget;
    private List<FoodEntry> foodEntries;
    private List<ExerciseEntry> exerciseEntries;
}
