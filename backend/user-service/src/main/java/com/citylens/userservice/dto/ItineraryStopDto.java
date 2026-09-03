package com.citylens.userservice.dto;

import lombok.Data;

@Data
public class ItineraryStopDto {
    private int stopOrder;
    private String name;
    private String category;
    private Double latitude;
    private Double longitude;
    private String arrivalTime;
    private int visitDuration;
    private String photoUrl;
    private String address;
}