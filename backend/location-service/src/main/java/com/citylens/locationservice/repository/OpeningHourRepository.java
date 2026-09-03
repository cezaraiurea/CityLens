package com.citylens.locationservice.repository;

import com.citylens.locationservice.entity.OpeningHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.*;

@Repository
public interface OpeningHourRepository extends JpaRepository<OpeningHour, Long> {
    List<OpeningHour> findByLocationId(Long locationId);

    List<OpeningHour> findByLocationIdAndDayOfWeek(Long locationId, Integer dayOfWeek);
}
