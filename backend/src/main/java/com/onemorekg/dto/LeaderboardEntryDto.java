package com.onemorekg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDto {
    private UUID userId;
    private String name;
    private double progressPercentage; // % progress towards target weight
    private int streak; // consecutive days logged
}
