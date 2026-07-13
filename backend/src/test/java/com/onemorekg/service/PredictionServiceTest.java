package com.onemorekg.service;

import com.onemorekg.dto.TrajectoryResponse;
import com.onemorekg.model.*;
import com.onemorekg.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PredictionServiceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private WeightLogRepository weightLogRepository;

    @Test
    public void testBaselinePrediction() {
        User user = User.builder()
                .name("Anjali")
                .email("anjali@onemorekg.com")
                .passwordHash("password")
                .age(30)
                .gender(Gender.FEMALE)
                .heightCm(160)
                .currentWeightKg(70)
                .targetWeightKg(60)
                .activityLevel(ActivityLevel.SEDENTARY)
                .build();
        user = userRepository.save(user);

        // Record initial weight log
        WeightLog wl = WeightLog.builder()
                .user(user)
                .loggedDate(LocalDate.now())
                .weightKg(70.0)
                .build();
        weightLogRepository.save(wl);

        TrajectoryResponse response = predictionService.getWeightTrajectory(user);
        assertNotNull(response);
        assertEquals(70.0, response.getCurrentWeight());
        assertEquals("BASELINE", response.getMethodUsed());
        assertNotNull(response.getPredictedWeight7Days());
        assertNotNull(response.getPredictedWeight30Days());
        assertTrue(response.getPredictedWeight30Days() < 70.0); // should predict weight loss
    }
}
