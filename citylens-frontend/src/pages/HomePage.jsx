import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { MAP_STYLES } from "../constants/mapConstants";
import { fetchCurrentWeather } from "../services/weatherService";
import { fetchNearbyLocations } from "../services/locationService";
import { fetchRecommendations } from "../services/recommendationService";
import { Home, Bookmark, User, Maximize, X, Compass } from "lucide-react";

import LocationModal from "../components/LocationModal";
import MapHeader from "../components/MapHeader";
import MapStyles from "../components/MapStyles";
import LocateMe from "../components/LocateMe";
import WeatherCard from "../components/WeatherCard";
import PoiMarker from "../components/PoiMarker";
import CategoryFilter from "../components/CategoryFilter";
import DistanceFilter from "../components/DistanceFilter";
import RecommendationStrip from "../components/RecommendationStrip"; 
import RouteLayer from "../components/RouteLayer";
import DiscoverDest from "../components/DiscoverDest";
import "./HomePage.css";
import "leaflet/dist/leaflet.css";

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
}

function MapEvents({ setPosition }) {
  useMapEvents({
    click: (e) => setPosition([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

function MapResizer({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12)
    return { kicker: "GOOD MORNING", hero: "Start your day right!" };
  if (hour >= 12 && hour < 17)
    return {
      kicker: "GOOD AFTERNOON",
      hero: "Enjoy the afternoon exploring places!",
    };
  if (hour >= 17 && hour < 21)
    return { kicker: "GOOD EVENING", hero: "Where the evening takes you?" };
  return { kicker: "GOOD NIGHT", hero: "The city is quiet, but not asleep!" };
}

const HomePage = () => {
  const [position, setPosition] = useState([46.7712, 23.5923]);
  const [weather, setWeather] = useState({
    temp: 0,
    condition: "",
    cityName: "",
    isRaining: false,
    timezoneOffset: 0,
  });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.voyager);
  const [address, setAddress] = useState("Fetching address...");
  const [locations, setLocations] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeDistance, setActiveDistance] = useState(1200);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [routeDestination, setRouteDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [travelMode, setTravelMode] = useState("foot"); 
  const navigate = useNavigate();

  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const localHour = new Date(
    utcTime + weather.timezoneOffset * 1000,
  ).getHours();
 
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        },
      );
    }
  }, []);
 
  useEffect(() => {
    const getAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`,
        );
        const data = await response.json();
        const street = data.address.road || data.address.pedestrian || "";
        const num = data.address.house_number
          ? ` ${data.address.house_number}`
          : "";
        const city =
          data.address.city || data.address.town || data.address.village || "";

        let finalAddress = street ? street + num : "";
        if (city) {
          finalAddress = finalAddress ? finalAddress + ", " + city : city;
        }
        setAddress(finalAddress || "Unknown location");
      } catch (error) {
        console.error("Geocoding error:", error);
        setAddress("Unavailable");
      }
    };
    getAddress();
  }, [position]);
 
  useEffect(() => {
    const getWeather = async () => {
      const data = await fetchCurrentWeather(position[0], position[1]);
      if (data) {
        setWeather({
          temp: data.temperature,
          condition: data.condition,
          cityName: data.cityName,
          isRaining: data.raining,
          isClear: data.clear,
          timezoneOffset: data.timezoneOffset,
        });
      }
    };
    getWeather();
  }, [position]);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!weather.timezoneOffset) return;

      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const localDate = new Date(utcTime + weather.timezoneOffset * 1000);
      const localHour = localDate.getHours();

      const data = await fetchRecommendations(
        position[0],
        position[1],
        weather.isRaining,
        localHour,
      ); 
      setRecommendations(data);
    };
    getRecommendations();
  }, [position, weather]);
 

  useEffect(() => {
    const getLocations = async () => {
      if (activeCategoryId === "none") {
        setLocations([]);
        return;
      }
      const data = await fetchNearbyLocations(
        position[0],
        position[1],
        activeCategoryId,
        activeDistance,
      );
      setLocations(data);
    };
    getLocations();
  }, [position, activeCategoryId, activeDistance]);
 

  const handleGetDirections = (location) => {
    setRouteStart([...position]);
    setRouteDestination([location.latitude, location.longitude]);
    setSelectedLocation(null);
  };

  return (
    <div className="dashboard-container">
      <div className="bg-glow" />

      {!isFullscreen && (
        <MapHeader
          onProfile={() => navigate("/profile")}
          onLocationFound={setPosition}
        />
      )}

      {(() => {
        const g = getGreeting(localHour);
        return (
          <div className="home-greeting animate-fade-in">
            <div className="home-greeting-kicker">
              {g.kicker}, {weather.cityName || address.split(",").pop().trim()}!
            </div>
            <h1 className="home-greeting-hero">{g.hero}</h1>
          </div>
        );
      })()}

      <main className="dashboard-main">
        <div
          className={`map-widget-container animate-fade-in ${isFullscreen ? "map-fullscreen" : ""}`}
        >
          <MapContainer
            center={position}
            zoom={14}
            zoomControl={false}
            className="modern-map"
          >
            <MapResizer trigger={isFullscreen} />
            <TileLayer url={mapStyle} attribution="&copy; OpenStreetMap" />
            <ChangeView center={position} />
            <MapEvents setPosition={setPosition} />

            {routeDestination && routeStart && (
              <RouteLayer
                start={routeStart}
                destinations={[routeDestination]}
                travelMode={travelMode}
                onRouteFound={(info) => setRouteInfo(info)}
              />
            )}

            {locations.map((loc) => (
              <PoiMarker
                key={loc.id}
                location={loc}
                onSelect={setSelectedLocation}
              />
            ))}

            <Marker position={position}>
              <Popup>You are here!</Popup>
            </Marker>
          </MapContainer>

          <button
            className="fullscreen-btn"
            onClick={() => setIsFullscreen((f) => !f)}
          >
            {isFullscreen ? <X size={20} /> : <Maximize size={20} />}
          </button>

          <div className="map-overlay-controls">
            <LocateMe onLocate={setPosition} />
            <MapStyles onStyleChange={setMapStyle} styles={MAP_STYLES} />
          </div>

          {routeDestination && (
            <div
              className="route-controls"
              style={{ top: isFullscreen ? "80px" : "16px" }}
            >
              <div className="travel-mode-selector">
                <button
                  onClick={() => setTravelMode("foot")}
                  className={travelMode === "foot" ? "active" : ""}
                >
                  Walk
                </button>
                <button
                  onClick={() => setTravelMode("bike")}
                  className={travelMode === "bike" ? "active" : ""}
                >
                  Bike
                </button>
                <button
                  onClick={() => setTravelMode("car")}
                  className={travelMode === "car" ? "active" : ""}
                >
                  Drive
                </button>
              </div>

              <button
                className="clear-route-btn"
                onClick={() => {
                  setRouteDestination(null);
                  setRouteStart(null);
                  setRouteInfo(null);
                }}
              >
               Clear Route
                {routeInfo &&
                  ` · ${routeInfo.distance}km · ${routeInfo.time} min`}
              </button>
            </div>
          )}

          {!selectedLocation && !isFullscreen && (
            <WeatherCard
              weather={weather}
              address={address}
              cityName={address.split(",").pop().trim()}
              isFullscreen={isFullscreen}
            />
          )}

          <CategoryFilter
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
          />

          <DistanceFilter
            activeDistance={activeDistance}
            onSelectDistance={setActiveDistance}
          />
        </div>
      </main>

      <div className="recommendations-section">
        <RecommendationStrip
          recommendations={recommendations}
          localHour={localHour}
          onSelectLocation={setSelectedLocation}
        />
      </div>

      <DiscoverDest onStart={() => navigate("/quiz")} />

      {selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onGetDirections={handleGetDirections}
        />
      )}

      {!isFullscreen && (
        <nav className="bottom-navigation-dock">
          <button className="dock-item active">
            <Home size={22} className="dock-icon" />
            <span className="dock-label">Home</span>
          </button>
          <button className="dock-item" onClick={() => navigate("/plan")}>
            <Compass size={22} className="dock-icon" />
            <span className="dock-label">Plan</span>
          </button>
          <button className="dock-item" onClick={() => navigate("/saved")}>
            <Bookmark size={22} className="dock-icon" />
            <span className="dock-label">Saved</span>
          </button>
          <button className="dock-item" onClick={() => navigate("/profile")}>
            <User size={22} className="dock-icon" />
            <span className="dock-label">Profile</span>
          </button>
        </nav>
      )}

      {loadingLocation && (
        <div className="location-loader">Finding your spots...</div>
      )}
    </div>
  );
};

export default HomePage;
