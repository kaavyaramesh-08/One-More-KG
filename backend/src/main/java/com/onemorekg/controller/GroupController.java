package com.onemorekg.controller;

import com.onemorekg.dto.GroupDto;
import com.onemorekg.dto.LeaderboardEntryDto;
import com.onemorekg.model.Group;
import com.onemorekg.model.User;
import com.onemorekg.security.UserPrincipal;
import com.onemorekg.service.GroupService;
import com.onemorekg.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Group> createGroup(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User user = userService.findById(currentUser.getId());
        Group group = groupService.createGroup(user, name);
        return ResponseEntity.ok(group);
    }

    @GetMapping
    public ResponseEntity<List<Group>> getUserGroups(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.findById(currentUser.getId());
        return ResponseEntity.ok(groupService.getUserGroups(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDto> getGroupDetails(
            @PathVariable UUID groupId) {
        try {
            GroupDto details = groupService.getGroupDetails(groupId);
            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID groupId) {
        try {
            User user = userService.findById(currentUser.getId());
            groupService.joinGroup(user, groupId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/invite")
    public ResponseEntity<?> inviteMember(
            @PathVariable UUID groupId,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        try {
            groupService.inviteMemberByEmail(groupId, email);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{groupId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @PathVariable UUID groupId) {
        try {
            List<LeaderboardEntryDto> leaderboard = groupService.getLeaderboard(groupId);
            return ResponseEntity.ok(leaderboard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
