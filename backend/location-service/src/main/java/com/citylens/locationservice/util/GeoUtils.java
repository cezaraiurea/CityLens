package com.citylens.locationservice.util;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeoUtils {

    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(Double latitudine, Double longitudine) {
        if (latitudine == null || longitudine == null) {
            return null;
        }
        return geometryFactory.createPoint(new Coordinate(longitudine, latitudine));
    }
}
