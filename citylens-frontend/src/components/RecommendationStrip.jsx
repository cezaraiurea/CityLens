import { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'; 
import './RecommendationStrip.css';

const stripTitle = (localHour) => {
    if(localHour >= 6 && localHour < 11) return 'Good morning picks';
    if(localHour >=11 && localHour < 15)  return 'Time for lunch';
    if(localHour >= 15 && localHour < 18) return 'Afternoon picks';
    return 'Tonight\'s picks';
};

const RecommendationCard = ({ location, onSelectLocation }) => {  
    const photoUrl = location.photoUrls?.[0] || null;
    
    return (
        <div className="strip-card" onClick={() => onSelectLocation(location)} >
            {photoUrl ? (
                <img src={photoUrl} alt={location.name} className="strip-card-img"
                     onError={(e) => e.target.style.display = 'none'} />
            ) : (
                <div className="strip-card-no-photo" />
            )}
            <div className="strip-card-overlay" />

            {location.category?.name && (
                <div className="strip-card-chip">{location.category.name}</div>
            )}

            <div className="strip-card-bottom">
                <div className="strip-card-name">{location.name}</div>
                {location.rating && (
                    <div className="strip-card-rating">
                        <Star size={12} fill="#d4943a" color="#d4943a" />
                        <span>{location.rating}</span>
                    </div>
                )}
                </div>
            </div>
    );
};
 
const RecommendationStrip = ({ recommendations, localHour, onSelectLocation }) => {
    const railRef = useRef(null);


    if(!recommendations || recommendations.length === 0)
        return null;

    const title = stripTitle(localHour);

    const scroll = (dir) => {
        if(railRef.current) 
            railRef.current.scrollBy({ left: dir * 336, behavior: 'smooth' });
    };

    return (
        <div className="recommendation-strip">
            <div className="strip-header">
                <div>
                    <div className="strip-kicker">For this moment</div>
                    <h3 className="strip-title">{title}</h3>
                </div>
                <div className="strip-arrows">
                    <button onClick={() => scroll(-1)}><ChevronLeft size={18} /></button>
                    <button onClick={() => scroll(1)}><ChevronRight size={18} /></button>
                </div>
            </div>
            <div className="strip-cards" ref={railRef}>
                {recommendations.map((location) => (
                    <RecommendationCard
                        key={location.id}
                        location={location}
                        onSelectLocation={onSelectLocation}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendationStrip;