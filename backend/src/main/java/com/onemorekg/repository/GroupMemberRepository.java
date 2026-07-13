package com.onemorekg.repository;

import com.onemorekg.model.Group;
import com.onemorekg.model.GroupMember;
import com.onemorekg.model.GroupMemberId;
import com.onemorekg.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(UUID groupId);
    List<GroupMember> findByUserId(UUID userId);
    boolean existsById(GroupMemberId id);
}
