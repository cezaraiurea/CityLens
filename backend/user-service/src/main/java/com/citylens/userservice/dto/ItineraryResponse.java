package com.citylens.userservice.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryResponse {
    private Long id;
    private String city;
    private String country;
    private LocalDate tripDate;
    private int hours;
    private LocalDateTime createdAt;
    private List<ItineraryStopDto> stops;
    private boolean completed;
    private List<String> photoUrls;
    private String journalNote;
}