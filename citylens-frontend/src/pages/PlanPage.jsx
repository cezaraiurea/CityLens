import { useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Navigation,
  Home,
  Bookmark,
  Compass,
  User,
} from "lucide-react";
import { MAP_STYLES } from "../constants/mapConstants";
import { fetchCityImage } from "../services/unsplashService";
import { generateItinerary } from "../services/itineraryService";
import LocationModal from "../components/LocationModal";
import { fetchLocationById } from "../services/locationService";
import { saveItinerary } from "../services/tripService"; 
import { fetchTopAttractions } from "../services/guideService";
import "./PlanPage.css";
import "leaflet/dist/leaflet.css";

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

function RecenterToStart({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

function numberedIcon(num) {
  return L.divIcon({
    className: "plan-marker",
    html: `<div class="plan-marker-pin">${num}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const PlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState(location.state || null);
  const [heroImg, setHeroImg] = useState(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [hours, setHours] = useState(5);
  const [itinerary, setItinerary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [tripDate, setTripDate] = useState("");
  const [saved, setSaved] = useState(false); 
  const [startHour, setStartHour] = useState(10);  
  const [startAddress, setStartAddress] = useState("");
  const [startCenter, setStartCenter] = useState(null);
  const [startMinute, setStartMinute] = useState(0);
  const [radius, setRadius] = useState(1000);
  const [attractions, setAttractions] = useState([]);
  const [startLocationName, setStartLocationName] = useState("");

  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatMonths = (s) => s.split(",").map((n) => MONTHS[parseInt(n)]).join(", ");

  useEffect(() => {
    if (city) fetchCityImage(city.city, "hero").then(setHeroImg);
  }, [city]);


  useEffect(() => {
    if(city?.city) {
      fetchTopAttractions(city.city, city.country).then(setAttractions);
    }
  }, [city]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const place = data[0];
        setCity({
          city:
            place.address.city ||
            place.address.town ||
            place.address.village ||
            query,
          country: place.address.country || "",
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          travelerType: null,
          score: null,
          description: null,
        });

        setQuery("");
        setItinerary(null);
        setStartPoint(null);
        setStartAddress("");
        setStartLocationName("");
        setSaved(false);
        setTripDate("");
        setSelectedLocation(null);
        setHours(5);
        setStartHour(10);
        setStartMinute(0);
        setRadius(1000); 
      } else {
        alert("City not found");
      }
    } catch (err) {
      console.error("Geocode error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSetStartAddress = async (e) => {
    e.preventDefault();
    if (!startAddress.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          startAddress + ", " + city.city,
        )}`,
      );

      const data = await res.json();
      if (data.length > 0) {
        setStartPoint([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setStartCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setStartLocationName(startAddress + ", " + city.city);
      } else {
        alert("Address not found!");
      }
    } catch (error) {
      console.error("Geocode error: ", error);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const lat = startPoint ? startPoint[0] : city.lat;
    const lng = startPoint ? startPoint[1] : city.lng;
    const dayOfWeek = tripDate ? new Date(tripDate).getDay() : null;
    const data = await generateItinerary(
      lat,
      lng,
      hours,
      city.travelerType, 
      startHour,
      startMinute,
      radius,
      {dayOfWeek, startLocationName}
    );
    setItinerary(data);
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!tripDate) {
      alert("Please pick a date for your trip");
      return;
    }
    const tripData = {
      city: city.city,
      country: city.country,
      tripDate: tripDate,
      hours: hours,
      stops: itinerary.stops.map((s) => ({
        stopOrder: s.order,
        name: s.name,
        category: s.category,
        latitude: s.latitude,
        longitude: s.longitude,
        arrivalTime: s.arrivalTime,
        visitDuration: s.visitDuration,
        photoUrl: s.photoUrls?.[0] || null,
        address: s.address,
      })),
    };
    const ok = await saveItinerary(tripData);
    if (ok) setSaved(true);
  };

  const openStopDetails = async (stopId) => {
    const data = await fetchLocationById(stopId);
    if (data) setSelectedLocation(data);
  };

  return (
    <div className="plan-page">
      <header className="plan-header">
        <div className="plan-logo">
          <div className="plan-logo-wrapper">
            <Navigation size={16} className="plan-logo-icon" />
          </div>
          <span>
            City<span className="plan-logo-accent">Lens</span>
          </span>
        </div>
      </header>

      <div className="plan-searchbar">
        <form onSubmit={handleSearch}>
          <Search size={17} />
          <input
            type="text"
            placeholder="Search another city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={searching}>
            {searching ? "..." : "Go"}
          </button>
        </form>
      </div>

      {!city ? (
        <div className="plan-empty">
          <h2>Where do you want to go?</h2>
          <p>Search for a city to start planning your trip.</p>
        </div>
      ) : (
        <>
          <section className="plan-hero">
            {heroImg && (
              <img src={heroImg} alt={city.city} className="plan-hero-img" />
            )}
            <div className="plan-hero-overlay" />
            <div className="plan-hero-text">
              <div className="plan-hero-meta">
                {city.score && <span>{city.score}% match</span>}
                {city.score && city.country && (
                  <span className="plan-dot">·</span>
                )}
                {city.country && <span>{city.country}</span>}
              </div>
              <h1 className="plan-hero-city">{city.city}</h1>
              {city.description && (
                <p className="plan-hero-desc">{city.description}</p>
              )}
              <div className="plan-hero-chips">
                {city.safety && (
                  <span className="plan-chip-info"> {city.safety}</span>
                )}
                {city.bestMonths && ( 
                  <span className="plan-chip-info">Best time: {formatMonths(city.bestMonths)}</span>
                )}
               </div> 
              <div className="plan-hero-actions">
                {city.travelerType && (
                  <div className="plan-hero-badge">
                    For the {city.travelerType}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="plan-body">
            <div className="plan-controls">
              <div className="plan-settings">
                <h3 className="plan-settings-title">Trip settings</h3>

                <div className="plan-settings-grid">
                  <div className="plan-setting-col">
                    <span className="plan-setting-label">Duration</span>
                    <div className="plan-stepper">
                      <button
                        onClick={() => setHours((h) => Math.max(1, h - 1))}
                      >
                        −
                      </button>
                      <span>{hours}h</span>
                      <button
                        onClick={() => setHours((h) => Math.min(12, h + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="plan-setting-col">
                    <span className="plan-setting-label">Start time</span>
                    <input
                      type="time"
                      className="plan-time-input"
                      value={`${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map(Number);
                        setStartHour(h);
                        setStartMinute(m);
                      }}
                    />
                  </div>
                </div>
 

                <div className="plan-setting-col" style={{ marginTop: "20px" }}>
                  <span className="plan-setting-label">Search radius</span>
                  <div className="plan-chips">
                    {[
                      { label: "800m", value: 800 },
                      { label: "1km", value: 1000 },
                      { label: "1.5km", value: 1500 },
                    ].map((r) => (
                      <button
                        key={r.value}
                        className={`plan-chip ${radius === r.value ? "active" : ""}`}
                        onClick={() => setRadius(r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                                {attractions.length > 0 && (
                  <div className="plan-setting-col" style={{ marginTop: "20px" }}>
                    <span className="plan-setting-label">
                      Popular attractions — tap to set as start
                    </span>
                    <div className="plan-chips">
                      {attractions.map((a, i) => (
                        <button
                          key={i}
                          className="plan-chip"
                          onClick={() => setStartAddress(a)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  className="plan-start-address"
                  onSubmit={handleSetStartAddress}
                >
                  <input
                    type="text"
                    placeholder="Introduce Start Address (Optional)"
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                  />
                  <button type="submit">Set start</button>
                </form>

                <div className="plan-settings-footer">
                  <div className="plan-startpoint-hint">
                    {startPoint
                      ? "Custom start point selected"
                      : "Click the map to set a custom start point (optional)"}
                  </div>

                  <div className="plan-setting-col" style={{ marginTop: "20px" }}>
                    <span className="plan-setting-label">Trip's day</span>
                    <input
                      type="date"
                      className="plan-time-input"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                    />
                  </div>

                  <button
                    className="plan-generate-btn"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? "Building..." : "Build my day "}
                  </button>
                </div>
              </div>
              {itinerary && (
                <div className="plan-itinerary">
                  <div className="plan-section-label">Your itinerary</div>
                  {itinerary.stops.length === 0 ? (
                    <p className="plan-no-stops">
                      No places found. Try more hours or another city.
                    </p>
                  ) : (
                    <>
                      {itinerary.stops.map((stop, i) => (
                        <div className="plan-stop-wrap" key={stop.order}>
                          <div
                            className="plan-stop"
                            onClick={() => openStopDetails(stop.id)}
                          >
                            <div className="plan-stop-time">
                              {stop.arrivalTime}
                            </div>
                            <div className="plan-stop-track">
                              <span className="plan-stop-dot">
                                {stop.order}
                              </span>
                            </div>
                            <div className="plan-stop-card">
                              {stop.photoUrls && stop.photoUrls.length > 0 && (
                                <img
                                  src={stop.photoUrls[0]}
                                  alt={stop.name}
                                  className="plan-stop-img"
                                  onError={(e) =>
                                    (e.target.style.display = "none")
                                  }
                                />
                              )}
                              <div className="plan-stop-info">
                                <div className="plan-stop-name">
                                  {stop.name}
                                </div>
                                <div className="plan-stop-meta">
                                  {stop.category} · {stop.visitDuration} min
                                </div>
                              </div>
                            </div>
                          </div>
                          {i < itinerary.stops.length - 1 && (
                            <div className="plan-walk">
                              {itinerary.stops[i + 1].travelMinutes} min walk
                            </div>
                          )}
                        </div>
                      ))}

                      {itinerary.returnMinutes > 0 && (
                        <div className="plan-return">
                          {" "}
                          {itinerary.returnMinutes} minutes back to start point
                        </div>
                      )}

                      <div className="plan-save">
                        <input
                          type="date"
                          value={tripDate}
                          onChange={(e) => setTripDate(e.target.value)}
                          className="plan-date-input"
                        />
                        <button
                          className="plan-save-btn"
                          onClick={handleSave}
                          disabled={saved}
                        >
                          {saved ? "Saved" : "Save trip"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="plan-map-col">
              <MapContainer
                center={[city.lat, city.lng]}
                zoom={13}
                zoomControl={false}
                className="plan-map"
              >
                <RecenterMap lat={city.lat} lng={city.lng} />
                <RecenterToStart center={startCenter} />
                <TileLayer
                  url={MAP_STYLES.voyager}
                  attribution="&copy; OpenStreetMap"
                />
                <MapClickHandler onPick={(p) => { setStartPoint(p); setStartLocationName(""); }} />

                {!startPoint && (
                  <Marker position={[city.lat, city.lng]}>
                    <Popup>{city.city}</Popup>
                  </Marker>
                )}
                {startPoint && (
                  <Marker position={startPoint}>
                    <Popup>Start point</Popup>
                  </Marker>
                )}

                {itinerary &&
                  itinerary.stops.map((stop) => (
                    <Marker
                      key={stop.order}
                      position={[stop.latitude, stop.longitude]}
                      icon={numberedIcon(stop.order)}
                      eventHandlers={{ click: () => openStopDetails(stop.id) }}
                    ></Marker>
                  ))}

                {itinerary && itinerary.stops.length > 1 && (
                  <Polyline
                    positions={itinerary.stops.map((s) => [
                      s.latitude,
                      s.longitude,
                    ])}
                    color="#d4943a"
                    weight={4}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </>
      )}

      {selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onGetDirections={() => {}}
        />
      )}

      <nav className="dock">
        <button className="dock-item" onClick={() => navigate("/home")}>
          <Home size={22} />
          <span>Home</span>
        </button>
        <button className="dock-item active">
          <Compass size={22} />
          <span>Plan</span>
        </button>
        <button className="dock-item" onClick={() => navigate("/saved")}>
          <Bookmark size={22} />
          <span>Saved</span>
        </button>
        <button className="dock-item" onClick={() => navigate("/profile")}>
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default PlanPage;
