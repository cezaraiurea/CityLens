package com.citylens.userservice.controller;

import com.citylens.userservice.dto.ProfileCreateRequest;
import com.citylens.userservice.dto.UserProfileResponse;
import com.citylens.userservice.dto.UserProfileUpdate;
import com.citylens.userservice.service.UserProfileService;

import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping("/internal/create")
    public ResponseEntity<Void> createProfile(@RequestBody ProfileCreateRequest request) {
        userProfileService.createProfile(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile( @RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(userProfileService.getUserProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestHeader("X-User-Email") String email,
                                                             @RequestBody UserProfileUpdate request) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(email, request));
    }

    @DeleteMapping("/internal/{userId}")
    public ResponseEntity<Void> deleteUserData(@PathVariable UUID userId) {
        userProfileService.deleteUserData(userId);
        return ResponseEntity.ok().build();
    }

}
