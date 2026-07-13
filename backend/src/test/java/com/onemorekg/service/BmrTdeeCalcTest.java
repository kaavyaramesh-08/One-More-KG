package com.onemorekg.service;

import com.onemorekg.dto.BmiResponse;
import com.onemorekg.dto.DietPlanResponse;
import com.onemorekg.model.ActivityLevel;
import com.onemorekg.model.Gender;
import com.onemorekg.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BmrTdeeCalcTest {

    @Autowired
    private UserService userService;

    @Autowired
    private DietPlanService dietPlanService;

    @Test
    public void testBmiCalculation() {
        User maleUser = User.builder()
                .name("Rohan")
                .email("rohan@onemorekg.com")
                .age(28)
                .gender(Gender.MALE)
                .heightCm(175)
                .currentWeightKg(80) // BMI = 80 / (1.75 * 1.75) = 26.12
                .targetWeightKg(70)
                .activityLevel(ActivityLevel.MODERATE)
                .build();

        BmiResponse bmiResp = userService.calculateBmi(maleUser);
        assertEquals(26.1, bmiResp.getBmi());
        assertEquals("Overweight", bmiResp.getCategory());
    }

    @Test
    public void testBmrTdeeCalculationMale() {
        User maleUser = User.builder()
                .name("Rohan")
                .email("rohan@onemorekg.com")
                .age(25)
                .gender(Gender.MALE)
                .heightCm(180)
                .currentWeightKg(80)
                .targetWeightKg(70)
                .activityLevel(ActivityLevel.ACTIVE) // 1.725 multiplier
                .build();

        // Mifflin-St Jeor (Male): BMR = 10 * 80 + 6.25 * 180 - 5 * 25 + 5 = 800 + 1125 - 125 + 5 = 1805
        // TDEE = 1805 * 1.725 = 3113.625
        // Target = 3113 - 500 = 2613 (rounded)
        DietPlanResponse plan = dietPlanService.calculateDietPlan(maleUser);
        assertEquals(1805.0, plan.getBmr());
        assertEquals(3113.6, plan.getTdee());
        assertEquals(2613, plan.getDailyCalorieTarget());
        
        // Macros: carbs (40% of 2613) = 1045.2 kcal = 261.3g
        // protein (30% of 2613) = 783.9 kcal = 195.975g ~ 196.0g
        assertEquals(261.3, plan.getCarbsGrams());
        assertEquals(196.0, plan.getProteinGrams());
    }
}
