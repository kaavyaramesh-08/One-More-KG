package com.onemorekg.dto;

import com.onemorekg.model.ActivityLevel;
import com.onemorekg.model.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Min(value = 1, message = "Age must be greater than 0")
    private int age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @Min(value = 30, message = "Height must be at least 30 cm")
    private double heightCm;

    @Min(value = 10, message = "Current weight must be at least 10 kg")
    private double currentWeightKg;

    @Min(value = 10, message = "Target weight must be at least 10 kg")
    private double targetWeightKg;

    @NotNull(message = "Activity level is required")
    private ActivityLevel activityLevel;
}
