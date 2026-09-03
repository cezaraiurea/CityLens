package com.citylens.locationservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryResponse {
    private List<ItineraryStop> stops;
    private int totalStops;
    private int returnMinutes;
    private boolean completed;
}
