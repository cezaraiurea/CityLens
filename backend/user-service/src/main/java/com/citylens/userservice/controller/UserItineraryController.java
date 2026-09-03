package com.citylens.userservice.controller;

import com.citylens.userservice.dto.ItineraryResponse;
import com.citylens.userservice.dto.SaveItineraryRequest;
import com.citylens.userservice.service.UserItineraryService;
import com.citylens.userservice.dto.JournalRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/itineraries")
public class UserItineraryController {

    private final UserItineraryService itineraryService;

    @PostMapping
    public ResponseEntity<Void> saveItinerary(@RequestHeader("X-User-Email") String email,
                                              @RequestBody SaveItineraryRequest request) {
        itineraryService.saveItinerary(email, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ItineraryResponse>> getItineraries(@RequestHeader("X-User-Email") String email) {
        List<ItineraryResponse> itineraries = itineraryService.getItineraries(email);
        return ResponseEntity.ok(itineraries);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable Long id) {
        itineraryService.markCompleted(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itineraryService.deleteItinerary(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("{id}/journal")
    public ResponseEntity<Void> updateJournal(@PathVariable Long id, @RequestBody JournalRequest request) {
        itineraryService.updateJournal(id, request.getPhotoUrls(), request.getJournalNote());
        return ResponseEntity.ok().build();
    }
}