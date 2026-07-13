package com.onemorekg.dto;

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
public class TrajectoryResponse {
    private double currentWeight;
    private double targetWeight;
    private Double predictedWeight7Days;
    private Double predictedWeight30Days;
    private String methodUsed; // "BASELINE" (deficit/7700) or "WEKA_REGRESSION"
    private List<TrajectoryPoint> points;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrajectoryPoint {
        private LocalDate date;
        private double weight;
        private String type; // "ACTUAL" or "PREDICTED"
    }
}
