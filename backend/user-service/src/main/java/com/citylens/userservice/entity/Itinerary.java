package com.citylens.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="itineraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    private String city;
    private String country;

    @Column(name = "trip_date")
    private LocalDate tripDate;

    private int hours;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ItineraryStop> stops = new ArrayList<>();

    private Boolean completed;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "itinerary_photos", joinColumns = @JoinColumn(name = "itinerary_id"))
    @Column(name = "photo_url", length = 500)
    @Builder.Default
    private List<String> photoUrls = new ArrayList<>();

    @Column(name = "journal_note", length = 2000)
    private String journalNote;


}
