package com.onemorekg.service;

import com.onemorekg.dto.DietPlanResponse;
import com.onemorekg.dto.TrajectoryResponse;
import com.onemorekg.model.DailyLog;
import com.onemorekg.model.ExerciseEntry;
import com.onemorekg.model.User;
import com.onemorekg.model.WeightLog;
import com.onemorekg.repository.DailyLogRepository;
import com.onemorekg.repository.ExerciseEntryRepository;
import com.onemorekg.repository.WeightLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import weka.classifiers.functions.LinearRegression;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    @Autowired
    private WeightLogRepository weightLogRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private ExerciseEntryRepository exerciseEntryRepository;

    @Autowired
    private DietPlanService dietPlanService;

    public TrajectoryResponse getWeightTrajectory(User user) {
        List<WeightLog> weightLogs = weightLogRepository.findByUserOrderByLoggedDateAsc(user);
        
        double startingWeight = user.getCurrentWeightKg();
        LocalDate startDate = LocalDate.now();

        // Populate actual history points
        List<TrajectoryResponse.TrajectoryPoint> trajectoryPoints = new ArrayList<>();
        if (!weightLogs.isEmpty()) {
            for (WeightLog wl : weightLogs) {
                trajectoryPoints.add(TrajectoryResponse.TrajectoryPoint.builder()
                        .date(wl.getLoggedDate())
                        .weight(wl.getWeightKg())
                        .type("ACTUAL")
                        .build());
            }
            WeightLog latestLog = weightLogs.get(weightLogs.size() - 1);
            startingWeight = latestLog.getWeightKg();
            startDate = latestLog.getLoggedDate();
        } else {
            // Seed starting weight as actual point for today if no logs exist
            trajectoryPoints.add(TrajectoryResponse.TrajectoryPoint.builder()
                    .date(startDate)
                    .weight(startingWeight)
                    .type("ACTUAL")
                    .build());
        }

        // We check if we have enough training data for Weka.
        // We need pairs of consecutive days with weight logs and daily summary logs.
        List<TrainingRow> trainingData = collectTrainingData(user, weightLogs);

        double currentWeight = startingWeight;
        Double predicted7Days = null;
        Double predicted30Days = null;
        String methodUsed = "BASELINE";

        // Generate projections
        if (trainingData.size() >= 14) {
            try {
                methodUsed = "WEKA_REGRESSION";
                // 1. Train linear regression model
                Instances dataset = buildWekaDataset(trainingData);
                LinearRegression lr = new LinearRegression();
                lr.buildClassifier(dataset);

                // 2. Compute user's average features over the last 14 logs to use for projection
                double avgDeficit = trainingData.stream().mapToDouble(r -> r.calorieDeficit).average().orElse(500.0);
                double avgWater = trainingData.stream().mapToDouble(r -> r.waterMl).average().orElse(2500.0);
                double avgExercise = trainingData.stream().mapToDouble(r -> r.exerciseMinutes).average().orElse(30.0);

                // 3. Project day by day
                for (int i = 1; i <= 30; i++) {
                    LocalDate projectDate = startDate.plusDays(i);
                    Instance inst = new DenseInstance(dataset.numAttributes());
                    inst.setDataset(dataset);
                    inst.setValue(0, avgDeficit);
                    inst.setValue(1, avgWater);
                    inst.setValue(2, avgExercise);

                    double predictedDelta = lr.classifyInstance(inst);
                    
                    // Sanity check/clipping: constrain change between -0.5kg and +0.5kg per day to prevent runaway models
                    if (predictedDelta < -0.5) predictedDelta = -0.5;
                    if (predictedDelta > 0.5) predictedDelta = 0.5;

                    currentWeight += predictedDelta;
                    currentWeight = Math.round(currentWeight * 100.0) / 100.0;

                    trajectoryPoints.add(TrajectoryResponse.TrajectoryPoint.builder()
                            .date(projectDate)
                            .weight(currentWeight)
                            .type("PREDICTED")
                            .build());

                    if (i == 7) predicted7Days = currentWeight;
                    if (i == 30) predicted30Days = currentWeight;
                }
            } catch (Exception e) {
                System.err.println("Weka regression failed, falling back to baseline: " + e.getMessage());
                // Reset and fallback
                trajectoryPoints.removeIf(p -> p.getType().equals("PREDICTED"));
                methodUsed = "BASELINE";
                currentWeight = startingWeight;
            }
        }

        // Baseline fallback (if less than 14 data points or if Weka execution failed)
        if (methodUsed.equals("BASELINE")) {
            // Get user's calorie plan
            DietPlanResponse plan = dietPlanService.calculateDietPlan(user);
            double dailyTdee = plan.getTdee();

            // Estimate average actual deficit from recent daily logs, or use plan target (500 kcal)
            List<DailyLog> recentLogs = dailyLogRepository.findByUserOrderByLogDateAsc(user);
            double projectedDeficit = 500.0; // default target
            if (!recentLogs.isEmpty()) {
                projectedDeficit = recentLogs.stream()
                        .mapToDouble(l -> dailyTdee - l.getCaloriesIn() + l.getCaloriesBurned())
                        .average()
                        .orElse(500.0);
            }
            if (projectedDeficit < 0) projectedDeficit = 200.0; // avoid proposing rapid weight gain unless heavily logged

            for (int i = 1; i <= 30; i++) {
                LocalDate projectDate = startDate.plusDays(i);
                
                // baseline formula: weight change = cumulative deficit / 7700
                // daily weight change = deficit / 7700
                double dailyWeightChange = - (projectedDeficit / 7700.0);
                currentWeight += dailyWeightChange;
                currentWeight = Math.round(currentWeight * 100.0) / 100.0;

                trajectoryPoints.add(TrajectoryResponse.TrajectoryPoint.builder()
                        .date(projectDate)
                        .weight(currentWeight)
                        .type("PREDICTED")
                        .build());

                if (i == 7) predicted7Days = currentWeight;
                if (i == 30) predicted30Days = currentWeight;
            }
        }

        return TrajectoryResponse.builder()
                .currentWeight(Math.round(startingWeight * 10.0) / 10.0)
                .targetWeight(Math.round(user.getTargetWeightKg() * 10.0) / 10.0)
                .predictedWeight7Days(predicted7Days)
                .predictedWeight30Days(predicted30Days)
                .methodUsed(methodUsed)
                .points(trajectoryPoints)
                .build();
    }

    private List<TrainingRow> collectTrainingData(User user, List<WeightLog> weightLogs) {
        List<TrainingRow> rows = new ArrayList<>();
        if (weightLogs.size() < 2) return rows;

        DietPlanResponse plan = dietPlanService.calculateDietPlan(user);
        double tdee = plan.getTdee();

        // Index weight logs by date for fast lookup
        Map<LocalDate, Double> weightMap = weightLogs.stream()
                .collect(Collectors.toMap(WeightLog::getLoggedDate, WeightLog::getWeightKg, (a, b) -> a));

        // For each daily log, check if we have weight for that day and the next day to get weightDelta
        List<DailyLog> dailyLogs = dailyLogRepository.findByUserOrderByLogDateAsc(user);
        for (DailyLog log : dailyLogs) {
            LocalDate today = log.getLogDate();
            LocalDate tomorrow = today.plusDays(1);

            if (weightMap.containsKey(today) && weightMap.containsKey(tomorrow)) {
                double weightToday = weightMap.get(today);
                double weightTomorrow = weightMap.get(tomorrow);
                double delta = weightTomorrow - weightToday;

                // Calorie deficit = TDEE - caloriesIn + caloriesBurned
                double deficit = tdee - log.getCaloriesIn() + log.getCaloriesBurned();
                
                // Get exercise duration
                List<ExerciseEntry> exercises = exerciseEntryRepository.findByUserAndLogDate(user, today);
                int duration = exercises.stream().mapToInt(ExerciseEntry::getDurationMinutes).sum();

                rows.add(new TrainingRow(deficit, log.getWaterMl(), duration, delta));
            }
        }
        return rows;
    }

    private Instances buildWekaDataset(List<TrainingRow> data) {
        ArrayList<Attribute> attrs = new ArrayList<>();
        attrs.add(new Attribute("calorieDeficit"));
        attrs.add(new Attribute("waterMl"));
        attrs.add(new Attribute("exerciseMinutes"));
        attrs.add(new Attribute("weightDelta")); // Class attribute (target)

        Instances dataset = new Instances("WeightDeltaDataset", attrs, data.size());
        dataset.setClassIndex(dataset.numAttributes() - 1);

        for (TrainingRow row : data) {
            double[] vals = new double[dataset.numAttributes()];
            vals[0] = row.calorieDeficit;
            vals[1] = row.waterMl;
            vals[2] = row.exerciseMinutes;
            vals[3] = row.weightDelta;
            dataset.add(new DenseInstance(1.0, vals));
        }
        return dataset;
    }

    private static class TrainingRow {
        double calorieDeficit;
        double waterMl;
        double exerciseMinutes;
        double weightDelta;

        TrainingRow(double calorieDeficit, double waterMl, double exerciseMinutes, double weightDelta) {
            this.calorieDeficit = calorieDeficit;
            this.waterMl = waterMl;
            this.exerciseMinutes = exerciseMinutes;
            this.weightDelta = weightDelta;
        }
    }
}
