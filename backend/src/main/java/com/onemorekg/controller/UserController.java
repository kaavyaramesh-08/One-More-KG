package com.onemorekg.controller;

import com.onemorekg.dto.BmiResponse;
import com.onemorekg.dto.UserProfileDto;
import com.onemorekg.model.User;
import com.onemorekg.security.UserPrincipal;
import com.onemorekg.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        return ResponseEntity.ok(userService.convertToProfileDto(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UserProfileDto profileDto) {
        User updatedUser = userService.updateUserProfile(currentUser.getId(), profileDto);
        return ResponseEntity.ok(userService.convertToProfileDto(updatedUser));
    }

    @GetMapping("/me/bmi")
    public ResponseEntity<BmiResponse> getMyBmi(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        return ResponseEntity.ok(userService.calculateBmi(user));
    }
}
