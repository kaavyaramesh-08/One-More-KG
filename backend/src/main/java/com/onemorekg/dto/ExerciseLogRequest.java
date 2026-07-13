package com.onemorekg.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ExerciseLogRequest {
    @NotBlank(message = "Activity type is required")
    private String activityType;

    @Min(value = 1, message = "Duration must be greater than 0 minutes")
    private int durationMinutes;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
