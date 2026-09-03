import { useState, useEffect, useRef, Fragment } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Bookmark,
  User,
  Calendar,
  Clock,
  Check,
  LocateFixed,
} from "lucide-react";
import { MAP_STYLES } from "../constants/mapConstants";
import { fetchCurrentWeather } from "../services/weatherService";
import { completeItinerary } from "../services/tripService";
import { fetchPlaceByText } from "../services/locationService";
import { fetchTip, fetchCityGuide } from "../services/guideService";
import { generateItinerary } from "../services/itineraryService";
import WeatherIcon from "../components/WeatherIcon";
import "./ActiveTripPage.css";
import "leaflet/dist/leaflet.css";

function numberedIcon(number) {
  return L.divIcon({
    className: "active-marker",
    html: `<div class="active-marker-pin">${number}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const youAreHereIcon = L.divIcon({
  className: "active-here-marker",
  html: `<div class="active-here-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickToSetPosition({ onSelect }) {
  useMapEvents({
    click: (e) => onSelect([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

function RouteToNext({ from, to }) {
  const [routeCoords, setRouteCoords] = useState([]);

  const fromLat = from?.[0];
  const fromLng = from?.[1];
  const toLat = to?.latitude;
  const toLng = to?.longitude;

  useEffect(() => {
    if (!fromLat || !fromLng || !toLat || !toLng) return;

    fetch(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        method: "POST",
        headers: {
          Authorization: import.meta.env.VITE_ORS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [fromLng, fromLat],
            [toLng, toLat],
          ],
        }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates.map((c) => [
            c[1],
            c[0],
          ]);
          setRouteCoords(coords);
        }
      })
      .catch((err) => console.error("Route error:", err));
  }, [fromLat, fromLng, toLat, toLng]);

  if (routeCoords.length === 0) return null;

  return (
    <Polyline
      positions={routeCoords}
      color="#4a90d9"
      weight={4}
      dashArray="8 8"
    />
  );
}

const ActiveTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip;

  const [weather, setWeather] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const shownTypesRef = useRef([]);
  const [userPosition, setUserPosition] = useState(null);
  const [started, setStarted] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [newHours, setNewHours] = useState(3);

  const [visited, setVisited] = useState(() => {
    const saved = localStorage.getItem(`trip-visited-${trip?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stops, setStops] = useState(
    trip ? [...trip.stops].sort((a, b) => a.stopOrder - b.stopOrder) : [],
  );
  const [replanning, setReplanning] = useState(false);
  const currentStop = stops.find((stop) => !visited.includes(stop.stopOrder));

  useEffect(() => {
    if (trip && trip.stops && trip.stops.length > 0) {
      const sorted = [...trip.stops].sort((a, b) => a.stopOrder - b.stopOrder);
      fetchCurrentWeather(sorted[0].latitude, sorted[0].longitude).then(
        setWeather,
      );
    }
  }, [trip]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!started || !weather || !currentStop) return;

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const scenarios = [];

    if (weather.raining) {
      scenarios.push({
        id: "rain",
        title: "It's raining",
        context:
          "It is raining. Recommend one cozy indoor place worth visiting.",
      });
    }
    if (weather.temperature >= 25) {
      scenarios.push({
        id: "hot",
        title: `It's hot · ${weather.temperature}°`,
        context:
          "It is very hot outside. Recommend a restaurant or a terrace for a cold drink or lemonade.",
      });
    }
    if (weather.clear && weather.sunset) {
      const minutesToSunset =
        toMinutes(weather.sunset) - toMinutes(currentStop.arrivalTime);
      if (minutesToSunset > 0 && minutesToSunset <= 30) {
        scenarios.push({
          id: "sunset",
          title: `Sunset at ${weather.sunset}`,
          context: "Recommend one single best place to watch the sunset.",
        });
      }
    }

    const next = scenarios.find((s) => !shownTypesRef.current.includes(s.id));
    if (!next) return;

    fetchTip(trip.city, next.context).then((name) => {
      if (name) {
        fetchPlaceByText(`${name}, ${trip.city}`).then((place) => {
          if (place) {
            shownTypesRef.current.push(next.id);
            setSuggestion({ title: next.title, place });
            setShowSuggestion(true);
          }
        });
      }
    });
  }, [started, currentStop, weather, trip]);

  if (!trip) {
    return (
      <div className="active-empty">
        <p>No itinerary selected.</p>
        <button className="active-back-btn" onClick={() => navigate("/saved")}>
          Back to Saved
        </button>
      </div>
    );
  }

  const startTime = stops.length > 0 ? stops[0].arrivalTime : "--:--";
  const mapCenter =
    stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [44.43, 26.1];

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        (error) => {
          console.error("Location error:", error);
          alert("Could not access your location.");
        },
      );
    }
  };

  const handleStart = () => {
    if (!userPosition) {
      alert("Set your starting point first.");
      return;
    }
    setStarted(true);
  };

  const handleArrived = () => {
    if (!currentStop) return;
    const updated = [...visited, currentStop.stopOrder];
    localStorage.setItem(`trip-visited-${trip.id}`, JSON.stringify(updated));
    setVisited(updated);
    setUserPosition([currentStop.latitude, currentStop.longitude]);
  };

  const handleReplan = async (category) => {
    if (!currentStop) return;
    setReplanning(true);

    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const fromLat = userPosition ? userPosition[0] : currentStop.latitude;
    const fromLng = userPosition ? userPosition[1] : currentStop.longitude;

    const startMin = toMin(currentStop.arrivalTime);
    const startH = Math.floor(startMin / 60);
    const startM = startMin % 60;

    const firstMin = toMin(stops[0].arrivalTime);
    const remainingMin = trip.hours * 60 - (startMin - firstMin);
    const remainingHours = Math.max(1, Math.ceil(remainingMin / 60));

    const visitedStops = stops.filter((s) => visited.includes(s.stopOrder));
    const excludeNames = visitedStops.map((s) => s.name);

    const data = await generateItinerary(
      fromLat,
      fromLng,
      remainingHours,
      trip.travelerType || "",
      startH,
      startM,
      1500,
      { startCategory: category, excludeNames },
    );

    setReplanning(false);

    if (!data || !data.stops || data.stops.length === 0) {
      alert("No alternatives found.");
      return;
    }

    const base = visitedStops.length;
    const newStops = data.stops.map((s, i) => ({
      stopOrder: base + i + 1,
      name: s.name,
      category: s.category,
      latitude: s.latitude,
      longitude: s.longitude,
      arrivalTime: s.arrivalTime,
      visitDuration: s.visitDuration,
      photoUrl: s.photoUrls?.[0] || null,
      address: s.address,
    }));

    setStops([...visitedStops, ...newStops]);
  };

  const handleReduceTime = async (newHours) => {
    if (!currentStop) return;

    setReplanning(true);

    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const fromLat = userPosition ? userPosition[0] : currentStop.latitude;
    const fromLng = userPosition ? userPosition[1] : currentStop.longitude;

    const startMin = toMin(currentStop.arrivalTime);
    const startH = Math.floor(startMin / 60);
    const startM = startMin % 60;

    const visitedStops = stops.filter((s) => visited.includes(s.stopOrder));
    const excludeNames = visitedStops.map((s) => s.name);

    const data = await generateItinerary(
      fromLat,
      fromLng,
      newHours,
      trip.travelerType || "",
      startH,
      startM,
      1500,
      { excludeNames },
    );

    setReplanning(false);

    if (!data || !data.stops || data.stops.length === 0) {
      alert("No alternatives found.");
      return;
    }

    const base = visitedStops.length;
    const newStops = data.stops.map((s, i) => ({
      stopOrder: base + i + 1,
      name: s.name,
      category: s.category,
      latitude: s.latitude,
      longitude: s.longitude,
      arrivalTime: s.arrivalTime,
      visitDuration: s.visitDuration,
      photoUrl: s.photoUrls?.[0] || null,
      address: s.address,
    }));

    setStops([...visitedStops, ...newStops]);
  };

  const toggleVisited = (stopOrder) => {
    const updated = visited.includes(stopOrder)
      ? visited.filter((order) => order !== stopOrder)
      : [...visited, stopOrder];
    localStorage.setItem(`trip-visited-${trip.id}`, JSON.stringify(updated));
    setVisited(updated);
  };

  const handleDone = async () => {
    await completeItinerary(trip.id);
    navigate("/saved");
  };

  const handleListen = async () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setGuideLoading(true);
    const text = await fetchCityGuide(trip.city, trip.country || "", "");
    setGuideLoading(false);
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ro-RO";
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const walkMinutes = (previous, current) => {
    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return (
      toMinutes(current.arrivalTime) -
      toMinutes(previous.arrivalTime) -
      previous.visitDuration
    );
  };

  return (
    <div className="active-page">
      <div className="active-layout">
        <aside className="active-sidebar">
          <h1 className="active-city">{trip.city}</h1>
          <p className="active-country">{trip.country}</p>

          <button
            className="active-guide-btn"
            onClick={handleListen}
            disabled={guideLoading}
          >
            {guideLoading
              ? "Loading..."
              : speaking
                ? "◼ Stop guide"
                : "► Listen to your guide"}
          </button>

          <div className="active-info">
            <div className="active-info-item">
              <Calendar size={15} />
              <span>{formatDate(trip.tripDate)}</span>
            </div>
            <div className="active-info-item">
              <Clock size={15} />
              <span>
                Start {startTime} · {trip.hours}h
              </span>
            </div>
          </div>

          {weather && (
            <div className="active-weather">
              <WeatherIcon
                weatherType={weather.condition}
                isCurrentlyRaining={weather.raining}
                localHour={new Date().getHours()}
              />
              <div>
                <div className="active-weather-temp">
                  {weather.temperature}°
                </div>
                <div className="active-weather-cond">{weather.condition}</div>
              </div>
            </div>
          )}

          {!started && (
            <div className="active-setup">
              <p className="active-setup-hint">
                Where are you now? Tap the map or use the location button.
              </p>
              <button
                className="active-done-btn"
                onClick={handleStart}
                disabled={!userPosition}
              >
                Start itinerary
              </button>
            </div>
          )}

          {started && (
            <div className="active-running">
              <div className="active-progress">
                <div className="active-progress-head">
                  <span className="active-progress-title">Progress</span>
                  <span className="active-progress-count">
                    {visited.length}/{stops.length} stops
                  </span>
                </div>
                <div className="active-stepper">
                  {stops.map((stop, index) => {
                    const isVisited = visited.includes(stop.stopOrder);
                    const isCurrent =
                      currentStop && currentStop.stopOrder === stop.stopOrder;
                    const previousVisited =
                      index > 0 && visited.includes(stops[index - 1].stopOrder);
                    return (
                      <div className="active-step" key={stop.stopOrder}>
                        {index > 0 && (
                          <div
                            className={
                              previousVisited
                                ? "active-step-line done"
                                : "active-step-line"
                            }
                          />
                        )}
                        <div
                          className={`active-step-dot${isVisited ? " done" : ""}${isCurrent ? " current" : ""}`}
                        >
                          {isVisited && <Check size={14} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentStop && (
                <div className="active-next">
                  {currentStop.photoUrl && (
                    <img
                      src={currentStop.photoUrl}
                      alt={currentStop.name}
                      className="active-next-img"
                    />
                  )}
                  <div className="active-next-body">
                    <div className="active-next-top">
                      <div className="active-next-label">Next stop</div>
                      <span className="active-next-time">
                        {currentStop.arrivalTime}
                      </span>
                    </div>
                    <div className="active-next-name">{currentStop.name}</div>
                    <div className="active-next-meta">
                      {currentStop.category}
                    </div>
                    {currentStop.address && (
                      <div className="active-next-addr">
                        {currentStop.address.split(",")[0]}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStop ? (
                <button className="active-done-btn" onClick={handleArrived}>
                  Arrived
                </button>
              ) : (
                <button className="active-done-btn" onClick={handleDone}>
                  Done
                </button>
              )}

              {currentStop && (
                <div className="active-replan">
                  <span className="active-replan-label">Need a break?</span>
                  <div className="active-replan-btns">
                    <button
                      onClick={() => handleReplan("Restaurant")}
                      disabled={replanning}
                    >
                      {" "}
                      Grab a bite
                    </button>
                    <button
                      onClick={() => handleReplan("Cafenea")}
                      disabled={replanning}
                    >
                      {" "}
                      Coffee break
                    </button>
                    <button
                      onClick={() => handleReplan("Parc")}
                      disabled={replanning}
                    >
                      {" "}
                      Relax in the park
                    </button>
                  </div>
                  {replanning && (
                    <div className="active-replan-loading">
                      Recalculating your route…
                    </div>
                  )}
                </div>
              )}

              {currentStop && (
                <div className="active-reduce">
                  <span className="active-reduce-label">
                    Changes in your time?
                  </span>
                  <div className="active-reduce-btns">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                    />
                    <button
                      onClick={() => handleReduceTime(newHours)}
                      disabled={replanning}
                    >
                      Recalculate
                    </button>
                  </div>
                  {replanning && (
                    <div className="active-replan-loading">
                      Recalculating your route...
                    </div>
                  )}
                </div>
              )}

              {suggestion && showSuggestion && (
                <div className="active-suggestion">
                  <div className="active-suggestion-head">
                    <span className="active-suggestion-title">
                      {suggestion.title}
                    </span>
                    <button
                      className="active-suggestion-close"
                      onClick={() => setShowSuggestion(false)}
                    >
                      ×
                    </button>
                  </div>
                  {suggestion.place.photoUrls &&
                    suggestion.place.photoUrls.length > 0 && (
                      <img
                        src={suggestion.place.photoUrls[0]}
                        alt={suggestion.place.name}
                        className="active-suggestion-img"
                      />
                    )}
                  <div className="active-suggestion-name">
                    {suggestion.place.name}
                  </div>
                  {suggestion.place.address && (
                    <div className="active-suggestion-addr">
                      {suggestion.place.address.split(",")[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        <div className="active-map-col">
          <MapContainer
            center={mapCenter}
            zoom={14}
            zoomControl={false}
            className="active-map"
          >
            <TileLayer
              url={MAP_STYLES.voyager}
              attribution="&copy; OpenStreetMap"
            />
            <ClickToSetPosition onSelect={setUserPosition} />

            {stops.map((stop) => (
              <Marker
                key={stop.stopOrder}
                position={[stop.latitude, stop.longitude]}
                icon={numberedIcon(stop.stopOrder)}
              />
            ))}

            {userPosition && (
              <Marker position={userPosition} icon={youAreHereIcon} />
            )}

            {started && userPosition && currentStop && (
              <RouteToNext from={userPosition} to={currentStop} />
            )}
          </MapContainer>

          <button
            className="active-locate-btn"
            onClick={handleLocate}
            title="My location"
          >
            <LocateFixed size={18} />
          </button>

          <div className="active-strip">
            {stops.map((stop, index) => {
              const isVisited = visited.includes(stop.stopOrder);
              const isCurrent =
                currentStop && currentStop.stopOrder === stop.stopOrder;
              const previous = stops[index - 1];
              const walk = previous ? walkMinutes(previous, stop) : null;
              return (
                <Fragment key={stop.stopOrder}>
                  {(walk != null) && (walk >= 0) && (
                    <div className="active-strip-walk"> {walk} min</div>
                  )}
                  <div
                    className={`active-strip-card${isVisited ? " visited" : ""}${isCurrent ? " current" : ""}`}
                    key={stop.stopOrder}
                    onClick={() => toggleVisited(stop.stopOrder)}
                  >
                    {stop.photoUrl && (
                      <img
                        src={stop.photoUrl}
                        alt={stop.name}
                        className="active-strip-img"
                      />
                    )}
                    <span className="active-strip-num">
                      {isVisited ? <Check size={14} /> : stop.stopOrder}
                    </span>
                    <div className="active-strip-info">
                      <div className="active-strip-name">{stop.name}</div>
                      <div className="active-strip-meta">
                        {stop.arrivalTime} · {stop.category}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="dock">
        <button className="dock-item" onClick={() => navigate("/home")}>
          <Home size={22} />
          <span>Home</span>
        </button>
        <button className="dock-item" onClick={() => navigate("/plan")}>
          <Compass size={22} />
          <span>Plan</span>
        </button>
        <button className="dock-item active" onClick={() => navigate("/saved")}>
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

export default ActiveTripPage;
