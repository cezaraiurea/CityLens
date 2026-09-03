package com.citylens.userservice.service;

import com.citylens.userservice.dto.FavoriteLocationDetails;
import com.citylens.userservice.dto.FavoriteResponse;
import com.citylens.userservice.entity.UserFavorite;
import com.citylens.userservice.entity.UserProfile;
import com.citylens.userservice.repository.UserFavoriteRepository;
import com.citylens.userservice.repository.UserProfileRepository;

import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final UserProfileRepository userProfileRepository;
    private final RestTemplate restTemplate;

    @Value("${location-service.url}")
    private String locationServiceUrl;

    public void addFavorite(String email, Long locationId) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(userFavoriteRepository.existsByUserIdAndLocationId(profile.getUserId(), locationId)) {
            throw new RuntimeException("Location already exists in favorites!");
        }

        UserFavorite userFavorite = UserFavorite.builder()
                .userId(profile.getUserId())
                .locationId(locationId)
                .build();

        userFavoriteRepository.save(userFavorite);
    }

    @Transactional
    public void removeFavorite(String email, Long locationId) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userFavoriteRepository.deleteByUserIdAndLocationId(profile.getUserId(), locationId);
    }

    public List<FavoriteResponse> getFavorites(String email) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserFavorite> favorites = userFavoriteRepository.findByUserIdOrderBySavedAtDesc(profile.getUserId());

        List<FavoriteResponse> favoriteResponses = new ArrayList<>();
        for (UserFavorite favorite : favorites) {
            FavoriteLocationDetails locationDetails = null;
            try {
                locationDetails = restTemplate.getForObject(
                        locationServiceUrl + "/api/locations/" + favorite.getLocationId(),
                        FavoriteLocationDetails.class
                );
            } catch (Exception e) {
                System.out.println("Error while fetching location details: " + e.getMessage());
            }

            FavoriteResponse favoriteResponse = FavoriteResponse.builder()
                    .id(favorite.getId())
                    .savedAt(favorite.getSavedAt())
                    .location(locationDetails)
                    .build();
            favoriteResponses.add(favoriteResponse);
        }
        return favoriteResponses;
    }

    public boolean isFavorite(String email, Long locationId) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userFavoriteRepository.existsByUserIdAndLocationId(profile.getUserId(), locationId);
    }
}