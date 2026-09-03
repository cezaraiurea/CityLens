package com.citylens.userservice.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SaveItineraryRequest {
    private String city;
    private String country;
    private LocalDate tripDate;
    private int hours;
    private List<ItineraryStopDto> stops;
}