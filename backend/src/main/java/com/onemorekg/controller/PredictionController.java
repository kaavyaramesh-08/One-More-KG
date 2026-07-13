package com.onemorekg.controller;

import com.onemorekg.dto.TrajectoryResponse;
import com.onemorekg.model.User;
import com.onemorekg.security.UserPrincipal;
import com.onemorekg.service.PredictionService;
import com.onemorekg.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predict")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private UserService userService;

    @GetMapping("/weight-trajectory")
    public ResponseEntity<TrajectoryResponse> getTrajectory(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        TrajectoryResponse response = predictionService.getWeightTrajectory(user);
        return ResponseEntity.ok(response);
    }
}
