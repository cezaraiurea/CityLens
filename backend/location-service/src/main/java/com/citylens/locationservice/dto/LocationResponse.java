package com.citylens.locationservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private List<String> photoUrls;

    private BigDecimal rating;
    private Boolean isIndoor;
    private Integer priceLevel;

    private Double latitude;
    private Double longitude;

    private Double distance;

    private CategoryResponse category;
    private List<OpeningHourResponse> openingHours;

}
