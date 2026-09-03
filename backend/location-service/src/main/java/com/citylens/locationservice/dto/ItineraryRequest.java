package com.citylens.locationservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class ItineraryRequest {
    private double latitude;
    private double longitude;
    private int hours;
    private String travelerType;
    private String budget;
    private int startHour;
    private int startMinute;
    private double radius;
    private String startCategory;
    private List<String> excludeNames;
    private Integer dayOfWeek;
    private String startLocationName;
}
