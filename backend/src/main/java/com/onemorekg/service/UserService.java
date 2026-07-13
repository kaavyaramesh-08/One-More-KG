package com.onemorekg.service;

import com.onemorekg.dto.BmiResponse;
import com.onemorekg.dto.RegisterRequest;
import com.onemorekg.dto.UserProfileDto;
import com.onemorekg.model.Gender;
import com.onemorekg.model.User;
import com.onemorekg.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address already in use.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .age(request.getAge())
                .gender(request.getGender())
                .heightCm(request.getHeightCm())
                .currentWeightKg(request.getCurrentWeightKg())
                .targetWeightKg(request.getTargetWeightKg())
                .activityLevel(request.getActivityLevel())
                .build();

        return userRepository.save(user);
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    @Transactional
    public User updateUserProfile(UUID userId, UserProfileDto dto) {
        User user = findById(userId);
        user.setName(dto.getName());
        user.setAge(dto.getAge());
        user.setGender(dto.getGender());
        user.setHeightCm(dto.getHeightCm());
        user.setTargetWeightKg(dto.getTargetWeightKg());
        user.setActivityLevel(dto.getActivityLevel());
        if (dto.getCurrentWeightKg() > 0) {
            user.setCurrentWeightKg(dto.getCurrentWeightKg());
        }
        return userRepository.save(user);
    }

    public BmiResponse calculateBmi(User user) {
        double heightM = user.getHeightCm() / 100.0;
        double bmi = user.getCurrentWeightKg() / (heightM * heightM);
        String category = getBmiCategory(bmi);
        return new BmiResponse(Math.round(bmi * 10.0) / 10.0, category);
    }

    public String getBmiCategory(double bmi) {
        if (bmi < 18.5) {
            return "Underweight";
        } else if (bmi < 25.0) {
            return "Normal";
        } else if (bmi < 30.0) {
            return "Overweight";
        } else {
            return "Obese";
        }
    }

    public UserProfileDto convertToProfileDto(User user) {
        BmiResponse bmi = calculateBmi(user);
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .age(user.getAge())
                .gender(user.getGender())
                .heightCm(user.getHeightCm())
                .currentWeightKg(user.getCurrentWeightKg())
                .targetWeightKg(user.getTargetWeightKg())
                .activityLevel(user.getActivityLevel())
                .bmi(bmi.getBmi())
                .bmiCategory(bmi.getCategory())
                .build();
    }
}
