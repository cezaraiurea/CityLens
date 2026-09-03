package com.citylens.userservice.controller;

import com.citylens.userservice.dto.FavoriteResponse;
import com.citylens.userservice.service.UserFavoriteService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorites")
public class UserFavoriteController {

    private final UserFavoriteService userFavoriteService;

    @PostMapping("/{locationId}")
    public ResponseEntity<Void> addFavorite(@RequestHeader("X-User-Email") String email,
                                            @PathVariable Long locationId) {
        userFavoriteService.addFavorite(email, locationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<Void> removeFavorite(@RequestHeader("X-User-Email") String email,
                                               @PathVariable Long locationId) {
        userFavoriteService.removeFavorite(email, locationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getFavorites(@RequestHeader("X-User-Email") String email) {
        List<FavoriteResponse> favorites = userFavoriteService.getFavorites(email);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/check/{locationId}")
    public ResponseEntity<Boolean> isFavorite(@RequestHeader("X-User-Email") String email,
                                              @PathVariable Long locationId) {
        boolean result = userFavoriteService.isFavorite(email, locationId);
        return ResponseEntity.ok(result);
    }

}
