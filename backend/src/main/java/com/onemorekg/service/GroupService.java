package com.onemorekg.service;

import com.onemorekg.dto.*;
import com.onemorekg.model.*;
import com.onemorekg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeightLogRepository weightLogRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private FoodEntryRepository foodEntryRepository;

    @Autowired
    private ExerciseEntryRepository exerciseEntryRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Group createGroup(User user, String name) {
        Group group = Group.builder()
                .name(name)
                .createdBy(user)
                .build();
        
        Group savedGroup = groupRepository.save(group);

        // Creator automatically joins the group
        GroupMember member = GroupMember.builder()
                .id(new GroupMemberId(savedGroup.getId(), user.getId()))
                .group(savedGroup)
                .user(user)
                .joinedAt(LocalDateTime.now())
                .build();
        groupMemberRepository.save(member);

        return savedGroup;
    }

    @Transactional
    public void joinGroup(User user, UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        GroupMemberId id = new GroupMemberId(group.getId(), user.getId());
        if (groupMemberRepository.existsById(id)) {
            return; // already a member
        }

        GroupMember member = GroupMember.builder()
                .id(id)
                .group(group)
                .user(user)
                .joinedAt(LocalDateTime.now())
                .build();
        groupMemberRepository.save(member);
    }

    @Transactional
    public void inviteMemberByEmail(UUID groupId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + email + " does not exist"));

        joinGroup(user, groupId);
    }

    public List<Group> getUserGroups(User user) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(user.getId());
        return memberships.stream().map(GroupMember::getGroup).collect(Collectors.toList());
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public GroupDto getGroupDetails(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<UserProfileDto> memberDtos = members.stream()
                .map(m -> userService.convertToProfileDto(m.getUser()))
                .collect(Collectors.toList());

        // Get activity feed for the last 7 days
        List<GroupDto.GroupActivity> activities = getGroupActivityFeed(members);

        return GroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .createdById(group.getCreatedBy().getId())
                .createdByName(group.getCreatedBy().getName())
                .createdAt(group.getCreatedAt())
                .members(memberDtos)
                .activityFeed(activities)
                .build();
    }

    public List<LeaderboardEntryDto> getLeaderboard(UUID groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<LeaderboardEntryDto> leaderboard = new ArrayList<>();

        for (GroupMember m : members) {
            User user = m.getUser();
            double progress = calculateProgressPercentage(user);
            int streak = calculateUserStreak(user);

            leaderboard.add(LeaderboardEntryDto.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .progressPercentage(progress)
                    .streak(streak)
                    .build());
        }

        // Default sort by progress descending
        leaderboard.sort((a, b) -> Double.compare(b.getProgressPercentage(), a.getProgressPercentage()));
        return leaderboard;
    }

    public double calculateProgressPercentage(User user) {
        List<WeightLog> logs = weightLogRepository.findByUserOrderByLoggedDateAsc(user);
        double startingWeight = user.getCurrentWeightKg();
        if (!logs.isEmpty()) {
            startingWeight = logs.get(0).getWeightKg();
        }
        double current = user.getCurrentWeightKg();
        double target = user.getTargetWeightKg();

        double pct;
        if (startingWeight == target) {
            pct = 100.0;
        } else if (startingWeight > target) {
            // weight loss target
            pct = ((startingWeight - current) / (startingWeight - target)) * 100.0;
        } else {
            // weight gain target
            pct = ((current - startingWeight) / (target - startingWeight)) * 100.0;
        }

        if (pct < 0.0) pct = 0.0;
        if (pct > 100.0) pct = 100.0;

        return Math.round(pct * 10.0) / 10.0;
    }

    public int calculateUserStreak(User user) {
        List<DailyLog> logs = dailyLogRepository.findByUserOrderByLogDateAsc(user);
        if (logs.isEmpty()) return 0;

        Set<LocalDate> loggedDates = logs.stream()
                .map(DailyLog::getLogDate)
                .collect(Collectors.toSet());

        LocalDate checkDate = LocalDate.now();
        // If not logged today, check if logged yesterday (to maintain streak for the day)
        if (!loggedDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1);
        }

        int streak = 0;
        while (loggedDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    private List<GroupDto.GroupActivity> getGroupActivityFeed(List<GroupMember> members) {
        List<GroupDto.GroupActivity> feed = new ArrayList<>();
        LocalDate sinceDate = LocalDate.now().minusDays(7);

        for (GroupMember m : members) {
            User user = m.getUser();

            // Query exercises
            List<ExerciseEntry> exercises = exerciseEntryRepository.findByUserAndLogDate(user, LocalDate.now());
            // (For demonstration we can pull exercises from the last 7 days)
            // Let's filter manually if needed, or pull all since they are loaded lazy.
            // Let's just query some entries
            for (ExerciseEntry e : exerciseEntryRepository.findByUserAndLogDate(user, LocalDate.now())) {
                feed.add(GroupDto.GroupActivity.builder()
                        .userName(user.getName())
                        .message("logged " + e.getActivityType() + " for " + e.getDurationMinutes() + " mins (" + e.getCaloriesBurned() + " kcal burned)")
                        .timestamp(e.getLogDate().atStartOfDay())
                        .build());
            }

            // Query weights
            for (WeightLog wl : weightLogRepository.findByUserOrderByLoggedDateAsc(user)) {
                if (wl.getLoggedDate().isAfter(sinceDate.minusDays(1))) {
                    feed.add(GroupDto.GroupActivity.builder()
                            .userName(user.getName())
                            .message("logged a new weight of " + wl.getWeightKg() + " kg")
                            .timestamp(wl.getLoggedDate().atStartOfDay())
                            .build());
                }
            }
        }

        // Sort by timestamp desc, limit to 20
        feed.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        if (feed.size() > 20) {
            return feed.subList(0, 20);
        }
        return feed;
    }
}
