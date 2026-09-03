package com.citylens.weatherservice.controller;

import com.citylens.weatherservice.service.WeatherService;
import com.citylens.weatherservice.dto.WeatherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherResponse> getCurrentWeather(@RequestParam double lat, @RequestParam double lon) {
        WeatherResponse weatherResponse = weatherService.getWeather(lat, lon);

        if (weatherResponse == null) {
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok(weatherResponse);
    }
}
