import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import './MapStyles.css';

const MapStyles = ({ onStyleChange, styles }) => {
    const [showLayers, setShowLayers] = useState(false);

    return (
        <div className="layer-control">
            <button
                className={`icon-btn ${showLayers ? 'active' : ''}`}
                onClick={() => setShowLayers(!showLayers)}
                title="Change Map Style"
            >
                <MapIcon size={20} />
            </button>

            {showLayers && (
                <div className="layer-menu animate-fade-in">
                    <div className="layer-menu-header">Map Styles</div>

                    <button onClick={() => { onStyleChange(styles.voyager); setShowLayers(false); }}>
                        Voyager
                    </button>
                    <button onClick={() => { onStyleChange(styles.dark); setShowLayers(false); }}>
                        Dark Mode
                    </button>
                    <button onClick={() => { onStyleChange(styles.light); setShowLayers(false); }}>
                        Light Mode
                    </button>
                    <button onClick={() => { onStyleChange(styles.satellite); setShowLayers(false); }}>
                        Satellite
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapStyles;