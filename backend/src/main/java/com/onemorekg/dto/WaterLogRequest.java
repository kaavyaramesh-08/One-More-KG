package com.onemorekg.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WaterLogRequest {
    @Min(value = 1, message = "Water amount must be greater than 0 ml")
    private int waterMl;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
