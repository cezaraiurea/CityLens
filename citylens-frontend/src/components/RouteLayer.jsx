import { useState, useEffect } from 'react';
import { Polyline } from 'react-leaflet'; 

const RouteLayer = ({ start, destinations, onRouteFound, travelMode = 'foot' }) => {
    const [routeCoords, setRouteCoords] = useState([]);

    const fromLat = start?.[0];
    const fromLng = start?.[1];
    const toLat = destinations?.[0]?.[0];
    const toLng = destinations?.[0]?.[1];

    useEffect(() => {
    if (!fromLat || !fromLng || !toLat || !toLng) 
        return;

    let profile = 'foot-walking';
    if (travelMode === 'bike')
        profile = 'cycling-regular';
    else if (travelMode === 'car')
        profile = 'driving-car';

    const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

    fetch(url, {
        method: 'POST',
        headers: {
            Authorization: import.meta.env.VITE_ORS_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coordinates: [
                [fromLng, fromLat],
                [toLng, toLat]
            ]
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.features && data.features.length > 0) {
            const route = data.features[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);

            if (onRouteFound) {
                const summary = route.properties.summary;
                onRouteFound({
                    distance: (summary.distance/1000).toFixed(1),
                    time: Math.round(summary.duration/60)
                });
            }
        }
    })
    .catch(err => console.error("Route error:", err));
}, [fromLat, fromLng, toLat, toLng, onRouteFound, travelMode]);

if(routeCoords.length === 0)
    return null; 
 
    return (
        <Polyline
            positions={routeCoords}
            color="#d4943a"
            weight={5}
            opacity={0.8}
        />
    );
};

export default RouteLayer;