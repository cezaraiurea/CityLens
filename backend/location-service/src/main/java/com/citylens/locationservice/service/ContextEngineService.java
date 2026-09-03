package com.citylens.locationservice.service;

import com.citylens.locationservice.dto.ContextEngineRequest;
import com.citylens.locationservice.dto.LocationResponse;
import com.citylens.locationservice.entity.Location;
import com.citylens.locationservice.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContextEngineService {

    private final LocationRepository locationRepository;
    private final LocationService locationService;

    private static final double RADIUS = 2000.0;
    private static final int MAX_RECOMMENDATIONS = 5;

    public List<LocationResponse> getRecommendations(ContextEngineRequest request) {
        List<Location> nearbyLocations = locationRepository.findNearby(
                request.getLatitude(),
                request.getLongitude(),
                RADIUS
        );

        List<String> recommendedCategories = getRecommendedCategoriesNames(
                request.getLocalHour(),
                request.getIsRaining()
        );

        List<Location> filteredLocations = new ArrayList<>();
        for(Location location : nearbyLocations) {
            if(location.getCategory() == null)
                continue;
            if(recommendedCategories.contains(location.getCategory().getName())) {
                filteredLocations.add(location);
            }
        }

        filteredLocations.sort((a, b) -> {
            double scoreA = calculateScore(a);
            double scoreB = calculateScore(b);
            return Double.compare(scoreB, scoreA);
        });

        List<Location> topLocations = new ArrayList<>();
        for(int i=0; i < Math.min(MAX_RECOMMENDATIONS, filteredLocations.size()); i++) {
            topLocations.add(filteredLocations.get(i));
        }

        List<LocationResponse> responseList = new ArrayList<>();
        for(Location location : topLocations) {
            responseList.add(locationService.mapToResponse(location));
        }

        return responseList;
    }

    private List<String> getRecommendedCategoriesNames(int localHour, boolean isRaining) {
        List<String> categories = new ArrayList<>();

        if(localHour >= 6 && localHour < 11) {
            categories.add("Cafenea");
            categories.add("Patiserie");
        }
        else if (localHour >= 11 && localHour < 15) {
            categories.add("Restaurant");
        }
        else if (localHour >= 15 && localHour < 18) {
            if(!isRaining) {
                categories.add("Atractie turistica");
                categories.add("Restaurant");
                categories.add("Cinema");
            }
        }
        else {
            categories.add("Bar");
            categories.add("Restaurant");
        }

        return categories;
    }

    private double calculateScore(Location location) {
        if(location.getRating() == null)
            return 0.0;
        return location.getRating().doubleValue()/5.0;
    }
}
