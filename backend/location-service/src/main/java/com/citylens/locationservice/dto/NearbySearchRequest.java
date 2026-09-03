package com.citylens.locationservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbySearchRequest {

    @NotNull(message = "Latitudinea este obligatorie!")
    private Double latitude;

    @NotNull(message = "Longitudinea este obligatorie!")
    private Double longitude;

    private Double distance;

    private Integer categoryId;
    private Integer priceLevel;
    private Boolean isIndoor;
}
