package com.citylens.locationservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStop {
    private int order;
    private Long id;
    private String name;
    private String category;
    private Double latitude;
    private Double longitude;
    private BigDecimal rating;
    private List<String> photoUrls;
    private String arrivalTime;
    private int visitDuration;
    private int travelMinutes;
    private String address;
}
