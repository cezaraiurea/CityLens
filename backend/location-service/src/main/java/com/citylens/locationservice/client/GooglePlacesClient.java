package com.citylens.locationservice.client;

import com.citylens.locationservice.dto.google.GooglePlaceItem;
import com.citylens.locationservice.dto.google.GooglePlacesResponse;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@RequiredArgsConstructor
public class GooglePlacesClient {

    private final RestTemplate restTemplate;

    @Value("${google.places.api.key}")
    private String googleApiKey;

    private static final String GOOGLE_PLACES_URL =
            "https://places.googleapis.com/v1/places:searchNearby";

    public GooglePlacesResponse getNearbyPlacesFromGoogle(double lat, double lng, double radius, String type) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask",
                "places.id," +
                        "places.displayName," +
                        "places.formattedAddress," +
                        "places.location," +
                        "places.rating," +
                        "places.priceLevel," +
                        "places.types," +
                        "places.photos," +
                        "places.regularOpeningHours"
        );

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> locationRestriction = new HashMap<>();
        Map<String, Object> center = new HashMap<>();
        Map<String, Object> circle = new HashMap<>();

        center.put("latitude", lat);
        center.put("longitude", lng);

        circle.put("center", center);
        circle.put("radius", radius);

        locationRestriction.put("circle", circle);

        requestBody.put("locationRestriction", locationRestriction);

        if(type!=null && !type.isEmpty()) {
            requestBody.put("includedPrimaryTypes", List.of(type));
        }

        requestBody.put("maxResultCount", 20);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<GooglePlacesResponse> response = restTemplate.exchange(
                GOOGLE_PLACES_URL,
                HttpMethod.POST,
                request,
                GooglePlacesResponse.class
        );
        return response.getBody();
    }

    public GooglePlacesResponse searchByText(String query) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleApiKey);
        headers.set("X-Goog-FieldMask",
                "places.id,places.displayName,places.formattedAddress,places.location," +
                        "places.rating,places.photos,places.types,places.priceLevel," +
                        "places.regularOpeningHours");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("textQuery", query);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<GooglePlacesResponse> response = restTemplate.exchange(
                "https://places.googleapis.com/v1/places:searchText",
                HttpMethod.POST,
                request,
                GooglePlacesResponse.class
        );
        return response.getBody();
    }
}
