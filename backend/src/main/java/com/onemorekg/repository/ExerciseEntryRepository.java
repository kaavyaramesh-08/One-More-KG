package com.onemorekg.repository;

import com.onemorekg.model.ExerciseEntry;
import com.onemorekg.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExerciseEntryRepository extends JpaRepository<ExerciseEntry, Long> {
    List<ExerciseEntry> findByUserAndLogDate(User user, LocalDate logDate);
}
