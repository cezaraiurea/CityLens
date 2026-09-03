package com.citylens.locationservice.controller;

import com.citylens.locationservice.dto.ItineraryRequest;
import com.citylens.locationservice.dto.ItineraryResponse;
import com.citylens.locationservice.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itinerary")
public class ItineraryController {
    private final ItineraryService itineraryService;

    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponse> generate(@RequestBody ItineraryRequest itineraryRequest) {
        return ResponseEntity.ok(itineraryService.generateItinerary(itineraryRequest));
    }

}
