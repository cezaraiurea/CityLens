package com.citylens.locationservice.service;

import com.citylens.locationservice.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final LocationService locationService;

    private static final double SEARCH_RADIUS = 200.0;
    private static final double WALK_SPEED = 50.0;
    private static final int MAX_WALK_MINUTES = 15;
    private static final double START_POI_RADIUS = 100.0;

    private static final Map<String, Integer> VISIT_DURATIONS = Map.ofEntries (
            Map.entry("Muzeu", 60),
            Map.entry("Atractie turistica", 60),
            Map.entry("Restaurant", 90),
            Map.entry("Parc", 40),
            Map.entry("Bar", 60),
            Map.entry("Cinema", 120),
            Map.entry("Cafenea", 30),
            Map.entry("Patiserie", 20),
            Map.entry("Mall", 90),
            Map.entry("Club de noapte", 120),
            Map.entry("Biserica", 30),
            Map.entry("Stadion", 40)
    );

    private static final Map<String, Set<String>> PROFILE_PREFERENCES = Map.ofEntries(
            Map.entry("Beach Lover", Set.of("Parc", "Cafenea", "Atractie turistica")),
            Map.entry("Culture Seeker", Set.of("Muzeu", "Atractie turistica", "Biserica")),
            Map.entry("Adventure Seeker", Set.of("Parc", "Atractie turistica", "Stadion")),
            Map.entry("Luxury Traveler", Set.of("Restaurant", "Mall", "Atractie turistica")),
            Map.entry("Nature Lover", Set.of("Parc", "Atractie turistica")),
            Map.entry("Foodie", Set.of("Restaurant", "Cafenea", "Patiserie")),
            Map.entry("Party Seeker", Set.of("Bar", "Club de noapte", "Restaurant")),
            Map.entry("Wellness Seeker", Set.of("Parc", "Cafenea")),
            Map.entry("Urban Explorer", Set.of("Mall", "Restaurant", "Atractie turistica")),
            Map.entry("Budget Backpacker", Set.of("Parc", "Cafenea", "Atractie turistica", "Muzeu")),
            Map.entry("Romantic Couple", Set.of("Restaurant", "Parc", "Cafenea")),
            Map.entry("Solo Traveler", Set.of("Muzeu", "Cafenea", "Atractie turistica")),
            Map.entry("History Buff", Set.of("Muzeu", "Atractie turistica", "Biserica")),
            Map.entry("Island Hopper", Set.of("Parc", "Atractie turistica", "Cafenea")),
            Map.entry("Mountain Lover", Set.of("Parc", "Atractie turistica")),
            Map.entry("Digital Nomad", Set.of("Cafenea", "Restaurant", "Mall")),
            Map.entry("Cozy Traveler", Set.of("Cafenea", "Patiserie", "Muzeu")),
            Map.entry("Art Lover", Set.of("Muzeu", "Atractie turistica")),
            Map.entry("City Breaker", Set.of("Mall", "Restaurant", "Bar", "Atractie turistica")),
            Map.entry("Luxury Adventurer", Set.of("Restaurant", "Atractie turistica", "Parc", "Muzeu")),
            Map.entry("Ultra Budget", Set.of("Parc", "Cafenea", "Atractie turistica")),
            Map.entry("Ultra Luxury", Set.of("Restaurant", "Muzeu", "Atractie turistica"))
    );

    private static final Set<String> FOOD_CATEGORIES = Set.of("Restaurant", "Cafenea", "Bar", "Patiserie");

    public ItineraryResponse generateItinerary(ItineraryRequest request) {
        double radius = request.getRadius() > 0 ? request.getRadius() : SEARCH_RADIUS;
        int totalAvailableMinutes = request.getHours() * 60;
        int usedMinutes = 0;
        double currentLatitude = request.getLatitude();
        double currentLongitude = request.getLongitude();

        Map<String, Integer> categoryCount = new HashMap<>();
        Set<Long> visitedLocationsIds = new HashSet<>();

        Set<String> excludeNames = new HashSet<>();
        if (request.getExcludeNames() != null)
            excludeNames.addAll(request.getExcludeNames());

        List<ItineraryStop> itineraryStops = new ArrayList<>();
        int stopNumber = 1;
        String lastCategory = null;

        int startHour = request.getStartHour() > 0 ? request.getStartHour() : 10;
        int startMinutesOfDay = startHour * 60 + request.getStartMinute();
        int currentDayOfWeek = (request.getDayOfWeek() != null)
                ? request.getDayOfWeek() : java.time.LocalDate.now().getDayOfWeek().getValue() % 7;


        NearbySearchRequest poolRequest = new NearbySearchRequest();
        poolRequest.setLatitude(request.getLatitude());
        poolRequest.setLongitude(request.getLongitude());
        poolRequest.setDistance(radius * 2);
        List<LocationResponse> allLocations = locationService.searchNearby(poolRequest);

        int radiusInMinutes = (int) Math.round(radius/WALK_SPEED);
        int maxWalk = MAX_WALK_MINUTES;

        
        if (request.getStartLocationName() != null && !request.getStartLocationName().isBlank()) {
            LocationResponse startLocation = findLocationAtStart(
                    allLocations, request.getLatitude(), request.getLongitude());

            if (startLocation == null)
                startLocation = locationService.findOrFetchByText(request.getStartLocationName());

            if (startLocation != null && startLocation.getCategory() != null
                    && startLocation.getLatitude() != null && startLocation.getLongitude() != null
                    && isOpenAt(startLocation, startMinutesOfDay, currentDayOfWeek)) {

                String startCategoryName = startLocation.getCategory().getName();
                int startVisitMinutes = getVisitDuration(startCategoryName);

                itineraryStops.add(ItineraryStop.builder()
                        .id(startLocation.getId())
                        .order(stopNumber++)
                        .name(startLocation.getName())
                        .category(startCategoryName)
                        .latitude(startLocation.getLatitude())
                        .longitude(startLocation.getLongitude())
                        .rating(startLocation.getRating())
                        .photoUrls(startLocation.getPhotoUrls())
                        .arrivalTime(formatTime(startMinutesOfDay))
                        .visitDuration(startVisitMinutes)
                        .travelMinutes(0)
                        .address(startLocation.getAddress())
                        .build());

                usedMinutes = startVisitMinutes;
                visitedLocationsIds.add(startLocation.getId());
                categoryCount.put(startCategoryName, 1);
                lastCategory = startCategoryName;
                currentLatitude = startLocation.getLatitude();
                currentLongitude = startLocation.getLongitude();
                maxWalk = radiusInMinutes;
            }
        }

        while (true) {
            List<LocationResponse> candidates = new ArrayList<>();

            for (LocationResponse location : allLocations) {
                if (visitedLocationsIds.contains(location.getId()))
                    continue;
                if (location.getCategory() == null)
                    continue;
                if (location.getLatitude() == null || location.getLongitude() == null)
                    continue;

                String categoryName = location.getCategory().getName();

                if (excludeNames.contains(location.getName()))
                    continue;

                boolean isForcedFirst = itineraryStops.isEmpty()
                        && request.getStartCategory() != null
                        && !request.getStartCategory().isBlank();
                if (isForcedFirst && !categoryName.equals(request.getStartCategory()))
                    continue;

                boolean isFood = FOOD_CATEGORIES.contains(categoryName);
                int timeUsed = categoryCount.getOrDefault(categoryName, 0);
                if (isFood && timeUsed >= 1)
                    continue;

                if (categoryName.equals(lastCategory))
                    continue;

                int visitMinutes = getVisitDuration(categoryName);
                int travelMinutes = getTravelMinutes(currentLatitude, currentLongitude, location.getLatitude(), location.getLongitude());

                if (travelMinutes > maxWalk)
                    continue;

                if (usedMinutes + travelMinutes + visitMinutes > totalAvailableMinutes)
                    continue;

                int arrivalMinutes = startMinutesOfDay + usedMinutes + travelMinutes;
                if (!isOpenAt(location, arrivalMinutes, currentDayOfWeek))
                    continue;

                int arrivalHour = (arrivalMinutes / 60) % 24;
                if (!isForcedFirst && !isCategorySuitable(categoryName, arrivalHour))
                    continue;

                candidates.add(location);
            }

            LocationResponse bestLocation = selectBestWithTopsis(
                    candidates, currentLatitude, currentLongitude, categoryCount, request.getTravelerType(), radius);

            if (bestLocation == null) {
                if (maxWalk >= radiusInMinutes * 4)
                    break;
                maxWalk= maxWalk*2;
                continue;
            }

            String categoryName = bestLocation.getCategory().getName();
            int visitMinutes = getVisitDuration(categoryName);
            int travelMinutes = getTravelMinutes(currentLatitude, currentLongitude, bestLocation.getLatitude(), bestLocation.getLongitude());
            int arrivalMinutes = startMinutesOfDay + usedMinutes + travelMinutes;

            itineraryStops.add(ItineraryStop.builder()
                    .id(bestLocation.getId())
                    .order(stopNumber++)
                    .name(bestLocation.getName())
                    .category(categoryName)
                    .latitude(bestLocation.getLatitude())
                    .longitude(bestLocation.getLongitude())
                    .rating(bestLocation.getRating())
                    .photoUrls(bestLocation.getPhotoUrls())
                    .arrivalTime(formatTime(arrivalMinutes))
                    .visitDuration(visitMinutes)
                    .travelMinutes(travelMinutes)
                    .address(bestLocation.getAddress())
                    .build());

            usedMinutes = usedMinutes + travelMinutes + visitMinutes;
            visitedLocationsIds.add(bestLocation.getId());
            categoryCount.put(categoryName, categoryCount.getOrDefault(categoryName, 0) + 1);
            lastCategory = categoryName;
            currentLatitude = bestLocation.getLatitude();
            currentLongitude = bestLocation.getLongitude();
            maxWalk = radiusInMinutes;
        }

        int returnMinutes = 0;
        if (!itineraryStops.isEmpty()) {
            ItineraryStop last = itineraryStops.get(itineraryStops.size() - 1);
            returnMinutes = getTravelMinutes(
                    last.getLatitude(), last.getLongitude(),
                    request.getLatitude(), request.getLongitude()
            );
        }

        return ItineraryResponse.builder()
                .stops(itineraryStops)
                .totalStops(itineraryStops.size())
                .returnMinutes(returnMinutes)
                .build();
    }

    private LocationResponse selectBestWithTopsis(List<LocationResponse> candidates,
                                                  double currentLatitude, double currentLongitude,
                                                  Map<String, Integer> categoryCount, String travelerType, double radius) {

        if (candidates.isEmpty())
            return null;

        if (candidates.size() == 1)
            return candidates.get(0);

        int numberOfCandidates = candidates.size();
        int numberOfCriteria = 4;
        double[][] decisionMatrice = new double[numberOfCandidates][numberOfCriteria];


        for (int i = 0; i < numberOfCandidates; i++) {
            LocationResponse location = candidates.get(i);
            String categoryName = location.getCategory().getName();

            double rating;
            if (location.getRating() != null)
                rating = location.getRating().doubleValue();
            else
                rating=2.5;


            double distance = haversine(currentLatitude, currentLongitude, location.getLatitude(), location.getLongitude());
            double proximity = 1 - Math.min(distance/radius, 1);


            int sameCategoryCount = categoryCount.getOrDefault(categoryName, 0);
            double diversity = 1.0/(1 + sameCategoryCount);


            Set<String> preferredCategories;
            if (travelerType != null)
                preferredCategories = PROFILE_PREFERENCES.get(travelerType);
            else
                preferredCategories = null;

            double profileMatch;
            if (preferredCategories != null && preferredCategories.contains(categoryName))
                profileMatch = 1;
            else
                profileMatch = 0;


            decisionMatrice[i][0] = rating;
            decisionMatrice[i][1] = proximity;
            decisionMatrice[i][2] = diversity;
            decisionMatrice[i][3] = profileMatch;
        }

        double[] weights = {0.25, 0.35, 0.10, 0.30};

        for (int j = 0; j < numberOfCriteria; j++) {
            double sumOfSquares = 0;
            for (int i = 0; i < numberOfCandidates; i++)
                sumOfSquares = sumOfSquares + decisionMatrice[i][j] * decisionMatrice[i][j];

            double norm = Math.sqrt(sumOfSquares);

            for (int i = 0; i < numberOfCandidates; i++)
                if (norm == 0)
                    decisionMatrice[i][j] = 0;
                else
                    decisionMatrice[i][j] = (decisionMatrice[i][j] / norm) * weights[j];
        }

        double[] idealBest = new double[numberOfCriteria];
        double[] idealWorst = new double[numberOfCriteria];
        for (int j = 0; j < numberOfCriteria; j++) {

            double maxValue = decisionMatrice[0][j];
            double minValue = decisionMatrice[0][j];
            for (int i = 1; i < numberOfCandidates; i++) {

                if (decisionMatrice[i][j] > maxValue)
                    maxValue = decisionMatrice[i][j];

                if (decisionMatrice[i][j] < minValue)
                    minValue = decisionMatrice[i][j];

            }
            idealBest[j] = maxValue;
            idealWorst[j] = minValue;
        }

        LocationResponse bestLocation = null;
        double bestScore = -1;

        for (int i = 0; i < numberOfCandidates; i++) {
            double distanceToBest = 0;
            double distanceToWorst = 0;

            for (int j = 0; j < numberOfCriteria; j++) {
                distanceToBest = distanceToBest + Math.pow(decisionMatrice[i][j] - idealBest[j], 2);
                distanceToWorst = distanceToWorst + Math.pow(decisionMatrice[i][j] - idealWorst[j], 2);
            }

            distanceToBest = Math.sqrt(distanceToBest);
            distanceToWorst = Math.sqrt(distanceToWorst);

            double topsisScore;
            if (distanceToBest + distanceToWorst == 0)
                topsisScore = 0;
            else
                topsisScore = distanceToWorst / (distanceToWorst + distanceToBest);

            if (topsisScore > bestScore) {
                bestScore = topsisScore;
                bestLocation = candidates.get(i);
            }
        }

        return bestLocation;
    }


    private int getVisitDuration(String category) {
        return VISIT_DURATIONS.getOrDefault(category, 60);
    }

    private int getTravelMinutes(double lat1, double lng1, double lat2, double lng2) {
        double meters = haversine(lat1, lng1, lat2, lng2);
        return (int) Math.round(meters/WALK_SPEED);
    }

    private LocationResponse findLocationAtStart(List<LocationResponse> locations, double latitude, double longitude) {
        LocationResponse closest = null;
        double closestDistance = START_POI_RADIUS;

        for (LocationResponse location : locations) {
            if (location.getCategory() == null)
                continue;
            if (location.getLatitude() == null || location.getLongitude() == null)
                continue;

            double distance = haversine(latitude, longitude, location.getLatitude(), location.getLongitude());
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = location;
            }
        }

        return closest;
    }

    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2-lat1);
        double dLng = Math.toRadians(lng2-lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private String formatTime(int totalMinutes) {
        int h = (totalMinutes / 60) % 24;
        int m = totalMinutes % 60;
        return String.format("%02d:%02d", h, m);
    }

    private boolean isOpenAt(LocationResponse location, int arrivalMinutesOfDay, int dayOfWeek) {
        List<OpeningHourResponse> hours = location.getOpeningHours();
        if(hours == null || hours.isEmpty())
            return true;

        int arrival = arrivalMinutesOfDay % (24*60);

        for (OpeningHourResponse h : hours) {
            if(h.getDayOfWeek() == null || h.getDayOfWeek()!= dayOfWeek)
                continue;
            if(h.getOpenTime() == null || h.getCloseTime() == null)
                continue;

            int open = h.getOpenTime().getHour()*60 + h.getOpenTime().getMinute();
            int close = h.getCloseTime().getHour()*60 + h.getCloseTime().getMinute();
            if(close <= open)
                close = close + 24*60;

            if(arrival >= open && arrival < close)
               return true;
        }

        return false;
    }

    private boolean isCategorySuitable(String category, int hour) {
        switch (category) {
            case "Cafenea":
            case "Patiserie":
                return hour >= 7 && hour < 18;
            case "Muzeu":
            case "Biserica":
                return hour >= 9 && hour < 18;
            case "Stadion":
                return hour >= 9 && hour < 20;
            case "Parc":
                return hour >= 8 && hour < 21;
            case "Atractie turistica":
                return hour >= 8 && hour < 22;
            case "Mall":
                return hour >= 10 && hour < 22;
            case "Cinema":
                return hour >= 12;
            case "Restaurant":
                return (hour >= 12 && hour < 23);
            case "Bar":
                return hour >= 18;
            case "Club de noapte":
                return hour >= 20;
            default:
                return true;
        }
    }
}
