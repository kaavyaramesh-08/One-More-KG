package com.onemorekg.repository;

import com.onemorekg.model.User;
import com.onemorekg.model.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    List<WeightLog> findByUserOrderByLoggedDateAsc(User user);
    Optional<WeightLog> findByUserAndLoggedDate(User user, LocalDate loggedDate);
}
