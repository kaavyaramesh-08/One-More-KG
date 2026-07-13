package com.onemorekg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    private UUID id;
    private String name;
    private String createdByName;
    private UUID createdById;
    private LocalDateTime createdAt;
    private List<UserProfileDto> members;
    private List<GroupActivity> activityFeed;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupActivity {
        private String userName;
        private String message;
        private LocalDateTime timestamp;
    }
}
