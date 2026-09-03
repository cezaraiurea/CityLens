import { useEffect, useRef, useState } from "react";
import "./Slideshow.css";

const COUNTRY_MUSIC = {
  Spain: "/music/spanish-guitar.mp3",
  Italy: "/music/italian-mandolin.mp3",
  France: "/music/french-accordion.mp3",
  Greece: "/music/greek.mp3" 
};

const Slideshow = ({ photos, country, city, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  const track = COUNTRY_MUSIC[country] || "/music/travel-default.mp3";
  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 < photos.length) {
          return prev + 1;
        }
        return 0;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [photos.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((error) => {
        console.log("Audio could not play:", error);
      });
    }
  }, []);

  return (
    <div className="slideshow-frame">
      <div
        className="slideshow-bg"
        style={{ backgroundImage: `url(${currentPhoto})` }}
      />

      <button className="slideshow-close" onClick={onClose}>×</button>

      {photos.map((url, index) => (
        <img
          key={index}
          src={url}
          alt=""
          className={index === currentIndex ? "slideshow-img active" : "slideshow-img"}
        />
      ))}

      <div className="slideshow-bottom">
        {city && <div className="slideshow-caption">{city}</div>}
        <div className="slideshow-dots">
          {photos.map((url, index) => (
            <span
              key={index}
              className={index === currentIndex ? "slideshow-dot active" : "slideshow-dot"}
            />
          ))}
        </div>
      </div>

      <audio ref={audioRef} src={track} loop />
    </div>
  );
};

export default Slideshow;