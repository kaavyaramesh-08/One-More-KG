package com.onemorekg.controller;

import com.onemorekg.dto.DietPlanResponse;
import com.onemorekg.model.User;
import com.onemorekg.security.UserPrincipal;
import com.onemorekg.service.DietPlanService;
import com.onemorekg.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/diet-plan")
public class DietPlanController {

    @Autowired
    private DietPlanService dietPlanService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<DietPlanResponse> getDietPlan(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        DietPlanResponse plan = dietPlanService.calculateDietPlan(user);
        return ResponseEntity.ok(plan);
    }
}
