package com.citylens.weatherservice.service;

import com.citylens.weatherservice.dto.WeatherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneOffset;

import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final RestTemplate restTemplate;

    @Value("${openweather.api.key}")
    private String apiKey;

    private static final String BASE_URL =
            "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric&lang=en";

    public WeatherResponse getWeather(double latitude, double longitude) {
        Map response = restTemplate.getForObject(
                BASE_URL,
                Map.class,
                latitude, longitude, apiKey
        );

        if (response == null) {
            return null;
        }

        String cityName = (String) response.get("name");

        Map mainData = (Map) response.get("main");
        int temperature = (int) Math.round(((Number) mainData.get("temp")).doubleValue());
        int humidity = ((Number) mainData.get("humidity")).intValue();

        int timezone = ((Number) response.get("timezone")).intValue();

        Map windData = (Map) response.get("wind");
        double windSpeed = ((Number) windData.get("speed")).doubleValue();

        Map weatherData = (Map) ((List) response.get("weather")).get(0);
        String condition = (String) weatherData.get("main");
        String description = (String) weatherData.get("description");
        String icon = (String) weatherData.get("icon");

        boolean isRaining = condition.equals("Rain") || condition.equals("Drizzle") || condition.equals("Thunderstorm");
        boolean isClear = condition.equals("Clear");

        Map sysData = (Map) response.get("sys");
        long sunsetSeconds = ((Number) sysData.get("sunset")).longValue();
        long localSunsetseconds = sunsetSeconds + timezone;

        LocalTime sunsetTime = Instant.ofEpochSecond(localSunsetseconds).
                atZone(ZoneOffset.UTC)
                .toLocalTime();

        String sunset = String.format("%02d:%02d", sunsetTime.getHour(), sunsetTime.getMinute());

        return WeatherResponse.builder()
                .cityName(cityName)
                .temperature(temperature)
                .condition(condition)
                .description(description)
                .humidity(humidity)
                .windSpeed(windSpeed)
                .icon(icon)
                .isRaining(isRaining)
                .isClear(isClear)
                .timezoneOffset(timezone)
                .sunset(sunset)
                .build();
    }
}
