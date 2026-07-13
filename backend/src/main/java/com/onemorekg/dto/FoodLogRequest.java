package com.onemorekg.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodLogRequest {
    @NotBlank(message = "Food name is required")
    private String foodName;

    @Min(value = 1, message = "Quantity must be greater than 0 grams")
    private double quantityGrams;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
