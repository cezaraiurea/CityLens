package com.citylens.locationservice.dto.google;

import lombok.Data;
import java.util.List;

@Data
public class GooglePlaceItem {
    private String id;
    private DisplayName displayName;
    private String formattedAddress;
    private LocationCoordinates location;
    private Double rating;
    private String priceLevel;
    private List<String> types;
    private List<PhotoItem> photos;
    private GoogleOpeningHours regularOpeningHours;
}
