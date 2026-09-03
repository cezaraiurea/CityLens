package com.citylens.locationservice.controller;

import com.citylens.locationservice.dto.ContextEngineRequest;
import com.citylens.locationservice.dto.LocationResponse;
import com.citylens.locationservice.service.ContextEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/locations")
public class ContextEngineController {

    private final ContextEngineService contextEngineService;

    @PostMapping("/recommendations")
    public ResponseEntity<List<LocationResponse>> getRecommendations(
            @RequestBody ContextEngineRequest request) {
        List<LocationResponse> recommendations = contextEngineService.getRecommendations(request);
        return ResponseEntity.ok(recommendations);
    }
}
