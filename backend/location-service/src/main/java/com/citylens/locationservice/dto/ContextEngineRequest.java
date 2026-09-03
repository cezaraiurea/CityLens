package com.citylens.locationservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContextEngineRequest {
    private Double latitude;
    private Double longitude;
    private Boolean isRaining;
    private Integer localHour;
}
