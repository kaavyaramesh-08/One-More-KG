package com.onemorekg.controller;

import com.onemorekg.service.FoodImageScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
public class FoodImageScanController {

    @Autowired
    private FoodImageScanService scanService;

    @PostMapping("/food-image")
    public ResponseEntity<?> scanFoodImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please upload a valid image file.");
            }
            Map<String, Object> result = scanService.scanFoodImage(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to parse food image: " + e.getMessage());
        }
    }
}
