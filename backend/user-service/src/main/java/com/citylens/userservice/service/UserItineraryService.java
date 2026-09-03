package com.citylens.userservice.service;

import com.citylens.userservice.dto.ItineraryResponse;
import com.citylens.userservice.dto.ItineraryStopDto;
import com.citylens.userservice.dto.SaveItineraryRequest;
import com.citylens.userservice.entity.Itinerary;
import com.citylens.userservice.entity.ItineraryStop;
import com.citylens.userservice.entity.UserProfile;
import com.citylens.userservice.repository.ItineraryRepository;
import com.citylens.userservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserProfileRepository userProfileRepository;

    public void saveItinerary(String email, SaveItineraryRequest request) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Itinerary itinerary = Itinerary.builder()
                .userId(profile.getUserId())
                .city(request.getCity())
                .country(request.getCountry())
                .tripDate(request.getTripDate())
                .hours(request.getHours())
                .build();

        for (ItineraryStopDto stopDto : request.getStops()) {
            ItineraryStop stop = ItineraryStop.builder()
                    .itinerary(itinerary)
                    .stopOrder(stopDto.getStopOrder())
                    .name(stopDto.getName())
                    .category(stopDto.getCategory())
                    .latitude(stopDto.getLatitude())
                    .longitude(stopDto.getLongitude())
                    .arrivalTime(stopDto.getArrivalTime())
                    .visitDuration(stopDto.getVisitDuration())
                    .photoUrl(stopDto.getPhotoUrl())
                    .address(stopDto.getAddress())
                    .build();
            itinerary.getStops().add(stop);
        }

        itineraryRepository.save(itinerary);
    }

    public List<ItineraryResponse> getItineraries(String email) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Itinerary> itineraries = itineraryRepository.findByUserIdOrderByTripDateDesc(profile.getUserId());

        List<ItineraryResponse> responses = new ArrayList<>();
        for (Itinerary itinerary : itineraries) {

            List<ItineraryStopDto> stopDtos = new ArrayList<>();
            for (ItineraryStop stop : itinerary.getStops()) {
                ItineraryStopDto dto = new ItineraryStopDto();
                dto.setStopOrder(stop.getStopOrder());
                dto.setName(stop.getName());
                dto.setCategory(stop.getCategory());
                dto.setLatitude(stop.getLatitude());
                dto.setLongitude(stop.getLongitude());
                dto.setArrivalTime(stop.getArrivalTime());
                dto.setVisitDuration(stop.getVisitDuration());
                dto.setPhotoUrl(stop.getPhotoUrl());
                dto.setAddress(stop.getAddress());
                stopDtos.add(dto);
            }

            ItineraryResponse response = ItineraryResponse.builder()
                    .id(itinerary.getId())
                    .city(itinerary.getCity())
                    .country(itinerary.getCountry())
                    .tripDate(itinerary.getTripDate())
                    .hours(itinerary.getHours())
                    .createdAt(itinerary.getCreatedAt())
                    .stops(stopDtos)
                    .completed(Boolean.TRUE.equals(itinerary.getCompleted()))
                    .photoUrls(itinerary.getPhotoUrls())
                    .journalNote(itinerary.getJournalNote())
                    .build();
            responses.add(response);
        }
        return responses;
    }

    public void markCompleted(Long itineraryId) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        itinerary.setCompleted(true);
        itineraryRepository.save(itinerary);
    }

    public void deleteItinerary(Long itineraryId) {
        itineraryRepository.deleteById(itineraryId);
    }

    public void updateJournal(Long itineraryId, List<String> photoUrls, String note) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if(photoUrls!=null) {
            itinerary.getPhotoUrls().clear();
            itinerary.getPhotoUrls().addAll(photoUrls);
        }
        itinerary.setJournalNote(note);
        itineraryRepository.save(itinerary);
    }
}