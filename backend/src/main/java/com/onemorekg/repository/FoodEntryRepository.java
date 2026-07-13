package com.onemorekg.repository;

import com.onemorekg.model.FoodEntry;
import com.onemorekg.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface FoodEntryRepository extends JpaRepository<FoodEntry, Long> {
    List<FoodEntry> findByUserAndLogDate(User user, LocalDate logDate);
}
