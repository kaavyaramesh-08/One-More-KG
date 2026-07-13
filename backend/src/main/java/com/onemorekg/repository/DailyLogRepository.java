package com.onemorekg.repository;

import com.onemorekg.model.DailyLog;
import com.onemorekg.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    Optional<DailyLog> findByUserAndLogDate(User user, LocalDate logDate);
    List<DailyLog> findByUserAndLogDateBetweenOrderByLogDateAsc(User user, LocalDate startDate, LocalDate endDate);
    List<DailyLog> findByUserOrderByLogDateAsc(User user);
}
