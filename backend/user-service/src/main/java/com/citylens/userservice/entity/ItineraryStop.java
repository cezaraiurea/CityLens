package com.citylens.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "itinerary_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @Column(name = "stop_order")
    private int stopOrder;

    private String name;
    private String category;
    private Double latitude;
    private Double longitude;

    @Column(name = "arrival_time")
    private String arrivalTime;

    @Column(name = "visit_duration")
    private int visitDuration;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    private String address;
}