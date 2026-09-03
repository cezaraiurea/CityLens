package com.citylens.locationservice.controller;

import com.citylens.locationservice.dto.LocationResponse;
import com.citylens.locationservice.dto.NearbySearchRequest;
import com.citylens.locationservice.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/nearby")
    public ResponseEntity<List<LocationResponse>> searchNearby(
            @Valid @RequestBody NearbySearchRequest request) {
        List<LocationResponse> locations = locationService.searchNearby(request);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getLocationById(@PathVariable Long id) {
        LocationResponse location = locationService.getLocationById(id);
        return ResponseEntity.ok(location);
    }

    @GetMapping("/search-text")
    public ResponseEntity<LocationResponse> searchByText(@RequestParam String query) {
        return ResponseEntity.ok(locationService.searchByText(query));
    }

}
