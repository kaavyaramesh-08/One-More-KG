package com.onemorekg.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WeightLogRequest {
    @Min(value = 10, message = "Weight must be at least 10 kg")
    private double weightKg;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
