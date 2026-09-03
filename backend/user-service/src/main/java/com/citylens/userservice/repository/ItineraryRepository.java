package com.citylens.userservice.repository;

import com.citylens.userservice.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByUserIdOrderByTripDateDesc(UUID userId);
}