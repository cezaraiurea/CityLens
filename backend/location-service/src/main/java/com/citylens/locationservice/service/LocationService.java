package com.citylens.locationservice.service;

import com.citylens.locationservice.client.GooglePlacesClient;
import com.citylens.locationservice.dto.*;
import com.citylens.locationservice.dto.google.*;
import com.citylens.locationservice.entity.*;
import com.citylens.locationservice.repository.*;
import com.citylens.locationservice.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final GooglePlacesClient googlePlacesClient;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final OpeningHourRepository openingHourRepository;

    @Value("${google.places.api.key}")
    private String googleApiKey;

    public List<LocationResponse> searchNearby(NearbySearchRequest request) {
        double distance;
        if(request.getDistance() != null) {
            distance = request.getDistance();
        }
        else {
            distance = 2000.0;
        }

        List<Location> localResults = locationRepository.findNearby(
                request.getLatitude(),
                request.getLongitude(),
                distance
        );

        List<Location> filteredResults = filterLocations(localResults, request);

        if(filteredResults.size() < 15) {
            System.out.println("No enough locations found in database. Searching on Google.");

            String googleType = null;
            if (request.getCategoryId() != null) {
                Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
                if (categoryOpt.isPresent()) {
                    googleType = mapCityLensCategoryToGoogle(categoryOpt.get().getName());
                }
            }

            fetchAndSaveFromGoogle(
                    request.getLatitude(),
                    request.getLongitude(),
                    distance,
                    googleType
            );

            localResults = locationRepository.findNearby(
                    request.getLatitude(),
                    request.getLongitude(),
                    distance
            );

            filteredResults = filterLocations(localResults, request);
        }
        else {
            System.out.println("Am gasit " + filteredResults.size() + " locatii in DB care respecta cerintele. Cost Google = 0.");
        }

        List<LocationResponse> responseList = new ArrayList<>();
        for(Location loc : filteredResults) {
            LocationResponse dto = mapToResponse(loc);

            if(dto.getLatitude() != null && dto.getLongitude() != null && request.getLatitude() != null && request.getLongitude() != null) {
                double dist = calculateDistance(
                        request.getLatitude(), request.getLongitude(),
                        dto.getLatitude(), dto.getLongitude());
                dto.setDistance((double)Math.round(dist));
            }
            responseList.add(dto);
        }

        return responseList;
    }

    private List<Location> filterLocations(List<Location> locations, NearbySearchRequest request) {
        List<Location> filtered = new ArrayList<>();
        for (Location loc : locations) {
            if(request.getCategoryId() != null) {
                if(loc.getCategory() == null) {
                    continue;
                }
                if(!loc.getCategory().getId().equals(request.getCategoryId())) {
                    continue;
                }
            }
            if(request.getPriceLevel() != null) {
                if(loc.getPriceLevel() == null) {
                    continue;
                }
                if(!loc.getPriceLevel().equals(request.getPriceLevel())) {
                    continue;
                }
            }
            if(request.getIsIndoor() != null) {
                if(loc.getIsIndoor() == null) {
                    continue;
                }
                if (!loc.getIsIndoor().equals(request.getIsIndoor())) {
                    continue;
                }
            }
            filtered.add(loc);
        }
        return filtered;
    }

    private void fetchAndSaveFromGoogle(double lat, double lng, double radius, String type) {

        GooglePlacesResponse googleResponse = googlePlacesClient.getNearbyPlacesFromGoogle(lat, lng, radius, type);

        if(googleResponse == null || googleResponse.getPlaces() == null) {
            System.out.println("Google Places API nu a returnat nimic.");
            return;
        }

        Set<String> processedIds = new HashSet<>();

        for(GooglePlaceItem item : googleResponse.getPlaces()) {

            if(item.getId() == null) {
                continue;
            }

            if(processedIds.contains(item.getId())) {
                continue;
            }

            processedIds.add(item.getId());

            if(locationRepository.existsByGooglePlaceId(item.getId())) {
                continue;
            }

            Location location = mapGoogleItemToEntity(item);
            if(location == null) {
                continue;
            }
            locationRepository.save(location);

            saveOpeningHours(item, location);
        }

        System.out.println("Am salvat locatii noi de la Google in DB.");

    }

    private void saveOpeningHours(GooglePlaceItem item, Location location) {
        if(item.getRegularOpeningHours() == null || item.getRegularOpeningHours().getPeriods() == null)
            return;

        for(GooglePeriod period : item.getRegularOpeningHours().getPeriods()) {
            if(period.getOpen() != null && period.getClose() != null) {
                OpeningHour hour = new OpeningHour();
                hour.setLocation(location);
                hour.setDayOfWeek(period.getOpen().getDay());
                hour.setOpenTime(LocalTime.of(period.getOpen().getHour(), period.getOpen().getMinute()));
                hour.setCloseTime(LocalTime.of(period.getClose().getHour(), period.getClose().getMinute()));
                openingHourRepository.save(hour);
            }
        }
    }

    private Location mapGoogleItemToEntity(GooglePlaceItem item) {

        Location location = new Location();
        location.setGooglePlaceId(item.getId());

        if(item.getDisplayName() != null) {
            location.setName(item.getDisplayName().getText());
        }

        location.setAddress(item.getFormattedAddress());

        if(item.getLocation() != null) {
            location.setGeom(GeoUtils.createPoint(
                    item.getLocation().getLatitude(),
                    item.getLocation().getLongitude()
            ));
        }

        if(item.getRating() != null) {
            location.setRating(BigDecimal.valueOf(item.getRating()));
        }

        location.setPriceLevel(parsePriceLevel(item.getPriceLevel()));

        if(item.getTypes() != null && !item.getTypes().isEmpty()) {
            Category category = mapCategoryFromGoogle(item.getTypes());
            if (category == null) {
                return null;
            }
            location.setCategory(category);

            String categoryName = category.getName();
            if (categoryName.equals("Parc") || categoryName.equals("Stadion") || categoryName.equals("Atractie turistica")) {
                location.setIsIndoor(false);
            } else {
                location.setIsIndoor(true);
            }

        } else {
            return null;
        }

        if(item.getPhotos() != null) {
            int maxPhotos = Math.min(3, item.getPhotos().size());
            for(int i = 0; i<maxPhotos; i++) {
                Photo photo = new Photo();
                photo.setPhotoName(item.getPhotos().get(i).getName());
                photo.setLocation(location);
                location.getPhotos().add(photo);
            }
        }


        location.setCachedAt(LocalDateTime.now());
        return location;
    }

    public LocationResponse mapToResponse(Location location) {
        Double lat = null;
        Double lng = null;
        if(location.getGeom() != null) {
            lng = location.getGeom().getX();
            lat = location.getGeom().getY();
        }

        CategoryResponse categoryResponse = null;
        if(location.getCategory() != null) {
            categoryResponse = CategoryResponse.builder()
                    .id(location.getCategory().getId())
                    .name(location.getCategory().getName())
                    .iconName(location.getCategory().getIconName())
                    .suggestedTime(location.getCategory().getSuggestedTime())
                    .build();
        }

        List<OpeningHourResponse> hours = new ArrayList<>();
        List<OpeningHour> openingHours = openingHourRepository.findByLocationId(location.getId());
        for (OpeningHour h : openingHours) {
            OpeningHourResponse hourDto = OpeningHourResponse.builder()
                    .dayOfWeek(h.getDayOfWeek())
                    .openTime(h.getOpenTime())
                    .closeTime(h.getCloseTime())
                    .build();
            hours.add(hourDto);
        }

        List<String> urls = new ArrayList<>();
        if(location.getPhotos() != null) {
            for(Photo p : location.getPhotos()) {
                urls.add("https://places.googleapis.com/v1/" + p.getPhotoName() +
                        "/media?maxHeightPx=800&key=" + googleApiKey);
            }
        }

        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .description(location.getDescription())
                .address(location.getAddress())
                .photoUrls(urls)
                .rating(location.getRating())
                .isIndoor(location.getIsIndoor())
                .priceLevel(location.getPriceLevel())
                .latitude(lat)
                .longitude(lng)
                .category(categoryResponse)
                .openingHours(hours)
                .build();
    }

    private Category mapCategoryFromGoogle(List<String> types) {
        Set<String> excludedTypes = Set.of(
                "supermarket", "grocery_store", "department_store",
                "gaz_station", "pharmacy");

        for (String type : types) {
            if(excludedTypes.contains(type)) {
                return null;
            }
        }

        Map<String, String> googleToCityLens = new HashMap<>();
        googleToCityLens.put("restaurant", "Restaurant");
        googleToCityLens.put("cafe", "Cafenea");
        googleToCityLens.put("museum", "Muzeu");
        googleToCityLens.put("park", "Parc");
        googleToCityLens.put("bar", "Bar");
        googleToCityLens.put("shopping_mall", "Mall");
        googleToCityLens.put("movie_theater", "Cinema");
        googleToCityLens.put("night_club", "Club de noapte");
        googleToCityLens.put("church", "Biserica");
        googleToCityLens.put("bakery", "Patiserie");
        googleToCityLens.put("tourist_attraction", "Atractie turistica");
        googleToCityLens.put("stadium", "Stadion");

        for (String googleType : types) {
            String categoryName = googleToCityLens.get(googleType);

            if(categoryName != null) {
                Optional<Category> existingCategory = categoryRepository.findByName(categoryName);
                if(existingCategory.isPresent()) {
                    return existingCategory.get();
                }
                else {
                    Category newCategory = Category.builder()
                            .name(categoryName)
                            .build();
                    return categoryRepository.save(newCategory);
                }
            }
        }

        return null;
    }

    private String mapCityLensCategoryToGoogle(String categoryName) {
        Map<String, String> cityLensToGoogle = new HashMap<>();
        cityLensToGoogle.put("Restaurant", "restaurant");
        cityLensToGoogle.put("Cafenea", "cafe");
        cityLensToGoogle.put("Muzeu", "museum");
        cityLensToGoogle.put("Parc", "park");
        cityLensToGoogle.put("Bar", "bar");
        cityLensToGoogle.put("Mall", "shopping_mall");
        cityLensToGoogle.put("Cinema", "movie_theater");
        cityLensToGoogle.put("Club de noapte", "night_club");
        cityLensToGoogle.put("Biserica", "church");
        cityLensToGoogle.put("Patiserie", "bakery");
        cityLensToGoogle.put("Atractie turistica", "tourist_attraction");
        cityLensToGoogle.put("Stadion", "stadium");
        return cityLensToGoogle.get(categoryName);
    }

    private Integer parsePriceLevel(String googlePriceLevel) {
        if(googlePriceLevel == null) {
            return null;
        }

        if(googlePriceLevel.equals("PRICE_LEVEL_FREE")) {
            return 0;
        }
        else if(googlePriceLevel.equals("PRICE_LEVEL_INEXPENSIVE")) {
            return 1;
        }
        else if(googlePriceLevel.equals("PRICE_LEVEL_MODERATE")) {
            return 2;
        }
        else if(googlePriceLevel.equals("PRICE_LEVEL_EXPENSIVE")) {
            return 3;
        }
        else if (googlePriceLevel.equals("PRICE_LEVEL_VERY_EXPENSIVE")) {
            return 4;
        }
        else {
            return null;
        }
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No location found with id: " + id));
        return mapToResponse(location);
    }

    public LocationResponse searchByText(String query) {
        GooglePlacesResponse googleResponse = googlePlacesClient.searchByText(query);
        if (googleResponse == null || googleResponse.getPlaces() == null || googleResponse.getPlaces().isEmpty()) {
            return null;
        }

        GooglePlaceItem item = googleResponse.getPlaces().get(0);

        Double latitude = null;
        Double longitude = null;
        if (item.getLocation() != null) {
            latitude = item.getLocation().getLatitude();
            longitude = item.getLocation().getLongitude();
        }

        List<String> photoUrls = new ArrayList<>();
        if (item.getPhotos() != null && !item.getPhotos().isEmpty()) {
            photoUrls.add("https://places.googleapis.com/v1/" + item.getPhotos().get(0).getName() +
                    "/media?maxHeightPx=800&key=" + googleApiKey);
        }

        return LocationResponse.builder()
                .name(item.getDisplayName() != null ? item.getDisplayName().getText() : query)
                .address(item.getFormattedAddress())
                .rating(item.getRating() != null ? BigDecimal.valueOf(item.getRating()) : null)
                .photoUrls(photoUrls)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }

    public LocationResponse findOrFetchByText(String query) {
        GooglePlacesResponse googleResponse = googlePlacesClient.searchByText(query);
        if(googleResponse == null || googleResponse.getPlaces() == null || googleResponse.getPlaces().isEmpty())
            return null;

        GooglePlaceItem item = googleResponse.getPlaces().get(0);
        if(item.getId() == null)
            return null;

        Optional<Location> existing = locationRepository.findByGooglePlaceId(item.getId());
        if(existing.isPresent())
            return mapToResponse(existing.get());

        Location location = mapGoogleItemToEntity(item);
        if(location == null) {
            System.out.println("Nu am putut incadra intr-o categorie: " + query);
            return null;
        }

        locationRepository.save(location);
        saveOpeningHours(item, location);

        System.out.println("Am adaugat punctul de start in DB: " + location.getName());
        return mapToResponse(location);
    }
}
