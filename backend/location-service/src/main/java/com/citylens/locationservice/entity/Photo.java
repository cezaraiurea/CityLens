package com.citylens.locationservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "location_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "photo_name", columnDefinition = "TEXT", nullable = false)
    private String photoName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;
}
