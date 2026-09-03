import { useState, useEffect } from 'react';
import { X, MapPin, Heart, Navigation } from 'lucide-react';
import { addFavorite, removeFavorite, checkIsFavorite } from '../services/favoriteService';
import './LocationModal.css';

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getPriceText = (priceLevel) => {
    if (!priceLevel || priceLevel === 0) return 'Free';
    if (priceLevel === 1) return 'Affordable';
    if (priceLevel === 2) return 'Moderate';
    if (priceLevel === 3) return 'Expensive';
    return 'Very Expensive';
};

const getOpenStatus = (openingHours) => {
    if (!openingHours || openingHours.length === 0) return null;
    const now = new Date();
    const today = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const todayHours = openingHours.find(h => h.dayOfWeek === today);
    if (!todayHours || !todayHours.openTime || !todayHours.closeTime) return null;

    const [oh, om] = todayHours.openTime.split(':').map(Number);
    const [ch, cm] = todayHours.closeTime.split(':').map(Number);
    let open = oh * 60 + om;
    let close = ch * 60 + cm;
    if (close <= open) close += 24 * 60;

    const isOpen = mins >= open && mins < close;
    let closeStr = todayHours.closeTime.slice(0, 5);
    if (closeStr === '00:00') closeStr = 'midnight';
    return { isOpen, closeStr };
};

const LocationModal = ({ location, onClose, onGetDirections, showDirections = true}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            try {
                const result = await checkIsFavorite(location.id);
                setIsFavorite(result);
            } catch (error) {
                console.error('Error while checking favorites:', error);
            }
        };
        if (location) checkFavorite();
    }, [location]);

    if (!location) return null;

    const categoryName = location.category?.name || 'Point of Interest';
    const rating = location.rating || null;
    const address = location.address || 'Address not available';
    const photos = location.photoUrls || [];
    const todayIndex = new Date().getDay();
    const openStatus = getOpenStatus(location.openingHours);

    let sortedHours = null;
    if (location.openingHours && location.openingHours.length > 0) {
        sortedHours = [...location.openingHours].sort((a, b) => (a.dayOfWeek || 7) - (b.dayOfWeek || 7));
    }

    const formatDistance = (distance) => {
        if (!distance) return null;
        if (distance < 1000) return `${Math.round(distance / 10) * 10} m away`;
        return `${(distance / 1000).toFixed(1)} km away`;
    };

    const handleFavoriteToggle = async () => {
        setIsLoading(true);
        try {
            if (isFavorite) { await removeFavorite(location.id); setIsFavorite(false); }
            else { await addFavorite(location.id); setIsFavorite(true); }
        } catch (error) {
            console.error('Error while updating favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="location-modal" onClick={(e) => e.stopPropagation()}>

                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-hero">
                    {photos.length > 0 ? (
                        <div className="photo-scroll">
                            {photos.map((url, i) => (
                                <img key={i} src={url} alt={location.name} className="modal-photo"
                                     onError={(e) => e.target.style.display = 'none'} />
                            ))}
                        </div>
                    ) : (
                        <div className="modal-no-photo">
                            <MapPin size={32} color="rgba(212, 160, 60, 0.4)" />
                            <span>No photos available</span>
                        </div>
                    )}
                    <div className="modal-hero-overlay" />
                    <div className="modal-hero-text">
                        <div className="modal-category">{categoryName}</div>
                        <h2 className="modal-title">{location.name}</h2>
                    </div>
                </div>

                <div className="modal-content">
                    <div className="modal-chips">
                        {rating && (
                            <div className="modal-chip">
                                <span>{rating}</span>
                            </div>
                        )}
                        <div className="modal-chip"> 
                            <span>{getPriceText(location.priceLevel)}</span>
                        </div>
                        {openStatus && (
                            <div className={`modal-chip ${openStatus.isOpen ? 'chip-open' : 'chip-closed'}`}> 
                                <span>{openStatus.isOpen ? `Open now` : 'Closed'}</span>
                            </div>
                        )}
                    </div>

                    <div className="modal-detail">
                        <div className="modal-section-label">Address</div>
                        <div className="modal-address-row"> 
                            <div>
                                <p>{address}</p>
                                {location.distance && <p className="modal-distance">{formatDistance(location.distance)}</p>}
                            </div>
                        </div>
                    </div>

                    {sortedHours && (
                        <div className="modal-detail">
                            <div className="modal-section-label">Opening Hours</div>
                            <ul className="modal-hours-list">
                                {sortedHours.map((hour, i) => {
                                    const isToday = hour.dayOfWeek === todayIndex;
                                    const open = hour.openTime ? hour.openTime.substring(0, 5) : '';
                                    const close = hour.closeTime ? hour.closeTime.substring(0, 5) : '';
                                    return (
                                        <li key={i} className={isToday ? 'hours-today' : ''}>
                                            <span className="hours-day">
                                                {isToday && <span className="hours-dot" />}
                                                {daysOfWeek[hour.dayOfWeek]}
                                            </span>
                                            <span className="hours-time">{open} - {close}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            className={`modal-action-btn ${isFavorite ? 'modal-action-btn-remove' : ''}`}
                            onClick={handleFavoriteToggle}
                            disabled={isLoading}
                        >
                            <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} style={{ marginRight: '8px' }} />
                            {isLoading ? '...' : isFavorite ? 'Remove' : 'Add to Favorites'}
                        </button>
                        {showDirections && (
                        <button
                            className="modal-directions-btn"
                            onClick={() => { onGetDirections(location); onClose(); }}
                        >
                            <Navigation size={16} style={{ marginRight: '8px' }} />
                            Get Directions
                        </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;