package com.citylens.locationservice.dto.google;

import lombok.Data;
import java.util.List;

@Data
public class GooglePlacesResponse {
    private List<GooglePlaceItem> places;
}
