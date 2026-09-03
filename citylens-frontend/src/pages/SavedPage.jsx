import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MAP_STYLES } from "../constants/mapConstants";
import {
  Home,
  Compass,
  Bookmark,
  User,
  Navigation,
  Trash2,
} from "lucide-react";
import { getItineraries, deleteItinerary } from "../services/tripService";
import { getFavorites } from "../services/favoriteService";
import { fetchCityImage } from "../services/unsplashService";
import LocationModal from "../components/LocationModal";
import "./SavedPage.css";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "passport-pin",
  html: `<div class="passport-pin-dot"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const TripCard = ({ trip, onStart, onDelete, onOpen }) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    fetchCityImage(trip.city).then(setImg);
  }, [trip.city]);

  return (
    <div
      className="trip-card"
      onClick={onOpen}
      style={onOpen ? { cursor: "pointer" } : undefined}
    >
      <div className="trip-card-photo">
        <button
          className="trip-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={15} />
        </button>
        {img && <img src={img} alt={trip.city} />}
        <div className="trip-card-overlay" />
        <div className="trip-card-head">
          <span className="trip-card-city">{trip.city}</span>
          <span className="trip-card-country">{trip.country}</span>
        </div>
        <div className="trip-card-stops">{trip.stops?.length || 0} stops</div>
      </div>
      <div className="trip-card-info">
        <span>{trip.tripDate || "No date"}</span>
        <span>{trip.hours}h</span>
      </div>
      {onStart && (
        <button
          className="trip-start-btn"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          Start
        </button>
      )}
    </div>
  );
};

const FavoriteCard = ({ favorite, onClick }) => {
  const loc = favorite.location;
  if (!loc) return null;
  const photo = loc.photoUrls?.[0] || null;

  return (
    <div className="fav-card" onClick={() => onClick(loc)}>
      <div className="fav-card-photo">
        {photo ? (
          <img src={photo} alt={loc.name} />
        ) : (
          <div className="fav-card-noimg" />
        )}
      </div>
      <div className="fav-card-info">
        <div className="fav-card-name">{loc.name}</div>
        <div className="fav-card-cat">{loc.category?.name}</div>
      </div>
    </div>
  );
};

const SavedPage = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const load = async () => {
      const trips = await getItineraries();
      const favs = await getFavorites();
      setItineraries(trips || []);
      setFavorites(favs || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this itinerary?")) return;

    const ok = await deleteItinerary(id);
    if (ok) setItineraries((prev) => prev.filter((t) => t.id !== id));
  };

  const visitedCities = [];
  const seenCities = new Set();
  itineraries.forEach((t) => {
    if (t.stops && t.stops.length > 0 && !seenCities.has(t.city)) {
      seenCities.add(t.city);
      visitedCities.push({
        city: t.city,
        country: t.country,
        lat: t.stops[0].latitude,
        lng: t.stops[0].longitude,
      });
    }
  });

  const countries = new Set(itineraries.map((t) => t.country).filter(Boolean))
    .size;
  const cities = new Set(itineraries.map((t) => t.city).filter(Boolean)).size;

  const today = new Date().toISOString().split("T")[0];
  const upcoming = itineraries.filter(
    (t) => !t.completed && t.tripDate && t.tripDate >= today,
  );
  const past = itineraries.filter(
    (t) => t.completed || !t.tripDate || t.tripDate < today,
  );

  if (loading) {
    return (
      <div className="saved-page">
        <div className="saved-loading">Loading your travels...</div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <header className="saved-header">
        <div className="saved-logo">
          <div className="saved-logo-wrapper">
            <Navigation size={16} className="saved-logo-icon" />
          </div>
          <span>
            City<span className="saved-logo-accent">Lens</span>
          </span>
        </div>
      </header>

      <div className="saved-content">
        <div className="saved-kicker">Your travels</div>
        <h1 className="saved-title">TRAVEL JOURNAL</h1>

        <div className="saved-stats">
          <div className="saved-stat">
            <span className="saved-stat-label">Countries</span>
            <span className="saved-stat-num gold">{countries}</span>
          </div>
          <div className="saved-stat">
            <span className="saved-stat-label">Cities</span>
            <span className="saved-stat-num">{cities}</span>
          </div>
          <div className="saved-stat">
            <span className="saved-stat-label">Itineraries</span>
            <span className="saved-stat-num">{itineraries.length}</span>
          </div>
          <div className="saved-stat">
            <span className="saved-stat-label">Favorites</span>
            <span className="saved-stat-num">{favorites.length}</span>
          </div>
        </div>

        {visitedCities.length > 0 && (
          <>
            <div className="saved-section-label">Your travel map</div>
            <div className="saved-map-wrap">
              <MapContainer
                center={[52, 13]}
                zoom={4}
                className="saved-map"
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url={MAP_STYLES.voyager}
                  attribution="&copy; OpenStreetMap"
                />
                {visitedCities.map((c, i) => (
                  <Marker key={i} position={[c.lat, c.lng]} icon={pinIcon}>
                    <Popup>
                      {c.city}, {c.country}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <div className="saved-section-label">Upcoming trips</div>
            <div className="saved-trips-grid">
              {upcoming.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onStart={() => navigate("/active", { state: { trip } })}
                  onDelete={() => handleDelete(trip.id)}
                />
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="saved-section-label">Past trips</div>
            <div className="saved-trips-grid">
              {past.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={() => handleDelete(trip.id)}
                  onOpen={() =>
                    navigate("/journal/" + trip.id, { state: { trip } })
                  }
                />
              ))}
            </div>
          </>
        )}

        {itineraries.length === 0 && (
          <p className="saved-empty-text">
            No saved trips yet. Plan your first one!
          </p>
        )}

        <div className="saved-section-label">Favorite places</div>
        {favorites.length === 0 ? (
          <p className="saved-empty-text">No favorites yet.</p>
        ) : (
          <div className="saved-favs-grid">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                favorite={fav}
                onClick={setSelectedLocation}
              />
            ))}
          </div>
        )}

        {selectedLocation && (
          <LocationModal
            location={selectedLocation}
            onClose={async () => {
              setSelectedLocation(null);
              const favs = await getFavorites();
              setFavorites(favs || []);
            }}
            onGetDirections={() => {}}
            showDirections={false}
          />
        )}
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
        <button className="dock-item active">
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

export default SavedPage;
