package com.citylens.userservice.service;

import com.citylens.userservice.dto.ProfileCreateRequest;
import com.citylens.userservice.dto.UserProfileResponse;
import com.citylens.userservice.dto.UserProfileUpdate;
import com.citylens.userservice.entity.UserProfile;
import com.citylens.userservice.entity.UserFavorite;
import com.citylens.userservice.entity.Itinerary;
import com.citylens.userservice.repository.UserProfileRepository;
import com.citylens.userservice.repository.UserFavoriteRepository;
import com.citylens.userservice.repository.ItineraryRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final ItineraryRepository itineraryRepository;

    public void createProfile(ProfileCreateRequest request) {
        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Acest profil exista deja!");
        }

        UserProfile userProfile = UserProfile.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .build();

        userProfileRepository.save(userProfile);
    }

    public UserProfileResponse getUserProfile(String email) {

        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profilul nu a fost gasit!"));

        return mapToResponse(profile);
    }

    public UserProfileResponse updateUserProfile(String email, UserProfileUpdate request) {

        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profilul nu a fost gasit!"));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getProfilePic() != null) profile.setProfilePic(request.getProfilePic());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());

        userProfileRepository.save(profile);

        return mapToResponse(profile);

    }

    private UserProfileResponse mapToResponse(UserProfile profile) {

        return UserProfileResponse.builder()
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .fullName(profile.getFullName())
                .profilePic(profile.getProfilePic())
                .bio(profile.getBio())
                .phoneNumber(profile.getPhoneNumber())
                .createdAt(profile.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteUserData(UUID userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findByUserIdOrderBySavedAtDesc(userId);
        userFavoriteRepository.deleteAll(favorites);

        List<Itinerary> itineraries = itineraryRepository.findByUserIdOrderByTripDateDesc(userId);
        itineraryRepository.deleteAll(itineraries);

        if(userProfileRepository.existsById(userId)) {
            userProfileRepository.deleteById(userId);
        }
    }
}
