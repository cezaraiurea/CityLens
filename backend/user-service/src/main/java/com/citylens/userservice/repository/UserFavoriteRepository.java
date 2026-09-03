package com.citylens.userservice.repository;

import com.citylens.userservice.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {

    List<UserFavorite> findByUserIdOrderBySavedAtDesc(UUID userId);

    boolean existsByUserIdAndLocationId(UUID userId, Long locationId);

    void deleteByUserIdAndLocationId(UUID userId, Long locationId);
}
