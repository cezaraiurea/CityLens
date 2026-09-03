package com.citylens.locationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_place_id", unique = true)
    private String googlePlaceId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point geom;

    private String address;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Photo> photos = new ArrayList<>();

    private BigDecimal rating;

    @Column(name = "is_indoor")
    private Boolean isIndoor;

    @Column(name = "price_level")
    private Integer priceLevel;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}
