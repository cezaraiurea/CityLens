package com.citylens.weatherservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherResponse {

    private String cityName;
    private int timezoneOffset;
    private int temperature;
    private String condition;
    private String description;
    private int humidity;
    private double windSpeed;
    private String icon;
    private boolean isRaining;
    private boolean isClear;
    private String sunset;
}
