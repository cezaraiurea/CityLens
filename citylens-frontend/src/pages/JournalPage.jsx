import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Navigation,
  Home,
  Compass,
  Bookmark,
  User, 
} from "lucide-react";
import { uploadImage } from "../services/cloudinaryService";
import { updateJournal, getItinerary } from "../services/tripService";
import { fetchCityImage } from "../services/unsplashService";
import Slideshow from "../components/Slideshow";
import "./JournalPage.css";

const JournalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const stateTrip = location.state?.trip;

  const [trip, setTrip] = useState(stateTrip || null);
  const [photos, setPhotos] = useState(
    stateTrip ? stateTrip.photoUrls || [] : [],
  );
  const [note, setNote] = useState(
    stateTrip ? stateTrip.journalNote || "" : "",
  );
  const [loading, setLoading] = useState(stateTrip ? false : true);
  const [heroImage, setHeroImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      if (stateTrip) {
        return;
      }

      const found = await getItinerary(id);
      if (found) {
        setTrip(found);
        setPhotos(found.photoUrls || []);
        setNote(found.journalNote || "");
      }
      setLoading(false);
    };

    loadTrip();
  }, [id, stateTrip]);

  useEffect(() => {
    if (trip) {
      fetchCityImage(trip.city, "hero").then(setHeroImage);
    }
  }, [trip]);

  const handleAddPhotos = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) {
      return;
    }

    setUploading(true);

    const newUrls = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) {
        newUrls.push(url);
      }
    }

    const allPhotos = [...photos, ...newUrls];
    setPhotos(allPhotos);
    await updateJournal(trip.id, allPhotos, note);

    setUploading(false);
  };

  const handleSaveNote = async () => {
    await updateJournal(trip.id, photos, note);
  };

  const handleRemovePhoto = async (photoUrl) => {
    const remaining = photos.filter((url) => url !== photoUrl);
    setPhotos(remaining);
    await updateJournal(trip.id, remaining, note);
  };

  if (loading) {
    return (
      <div className="journal-empty">
        <p>Loading...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="journal-empty">
        <p>Trip not found.</p>
        <button onClick={() => navigate("/saved")}>Back to Saved</button>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <header className="journal-topbar">
        <div className="journal-logo">
          <div className="journal-logo-wrapper">
            <Navigation size={16} className="journal-logo-icon" />
          </div>
          <span>
            City<span className="journal-logo-accent">Lens</span>
          </span>
        </div>
      </header>

      <div className="journal-content">
        <div className="journal-hero">
          {heroImage && (
            <img src={heroImage} alt={trip.city} className="journal-hero-img" />
          )}
          <div className="journal-hero-overlay" />

          {photos.length > 0 && (
            <button
              className="journal-play"
              onClick={() => setShowSlideshow(true)}
            >
              ► Play slideshow
            </button>
          )}

          <div className="journal-hero-text">
            <h1>{trip.city}</h1>
            <span>
              {trip.country} · {trip.tripDate}
            </span>
          </div>
        </div>

        {showSlideshow && (
          <Slideshow
            photos={photos}
            country={trip.country}
            city={trip.city}
            onClose={() => setShowSlideshow(false)}
          />
        )}

        <div className="journal-note-card">
          <div className="journal-note-label">  
            <span>My notes</span>
          </div>
          <textarea
            className="journal-note"
            placeholder="What made this trip special? Write your memories here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSaveNote}
          />
        </div>

        <div className="journal-columns">
          <div className="journal-col">
            <div className="journal-col-title">That day's stops</div>
            {trip.stops &&
              [...trip.stops]
                .sort((a, b) => a.stopOrder - b.stopOrder)
                .map((stop) => (
                  <div className="journal-stop" key={stop.stopOrder}>
                    <span className="journal-stop-num">{stop.stopOrder}</span>
                    <div className="journal-stop-info">
                      <div className="journal-stop-name">{stop.name}</div>
                      <div className="journal-stop-meta">{stop.category}</div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="journal-col">
            <div className="journal-col-title">Photos</div>
            <label className="journal-add">
              {uploading ? "Uploading..." : "+ Add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleAddPhotos}
                disabled={uploading}
              />
            </label>
            <div className="journal-grid">
              {photos.map((url, index) => (
                <div className="journal-photo" key={index}>
                  <img src={url} alt={"memory " + index} />
                  <button
                    className="journal-photo-del"
                    onClick={() => handleRemovePhoto(url)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length === 0 && (
                <p className="journal-empty-text">
                  No photos yet. Add your first memory!
                </p>
              )}
            </div>
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

export default JournalPage;
