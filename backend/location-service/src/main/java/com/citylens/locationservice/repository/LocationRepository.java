package com.citylens.locationservice.repository;

import com.citylens.locationservice.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query(value = "SELECT * FROM locations l WHERE " +
            "ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :distance)",
            nativeQuery = true)
    List<Location> findNearby(@Param("lat") double lat, @Param("lon") double lon, @Param("distance") double distance);

    List<Location> findByCategoryId(Integer categoryId);

    boolean existsByGooglePlaceId(String googlePlaceId);

    Optional<Location> findByGooglePlaceId(String googlePlaceId);
}
