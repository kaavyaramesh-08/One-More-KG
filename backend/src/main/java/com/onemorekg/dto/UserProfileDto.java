package com.onemorekg.dto;

import com.onemorekg.model.ActivityLevel;
import com.onemorekg.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private UUID id;
    private String name;
    private String email;
    private int age;
    private Gender gender;
    private double heightCm;
    private double currentWeightKg;
    private double targetWeightKg;
    private ActivityLevel activityLevel;
    private double bmi;
    private String bmiCategory;
}
