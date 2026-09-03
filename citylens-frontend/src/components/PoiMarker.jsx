import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Utensils, TreePine, MapPin, Coffee, Landmark, Wine, Cookie } from 'lucide-react';

const createCustomIcon = (categoryName) => {
    let IconComponent = MapPin;
    let pinColor = '#d4943a';

    const name = categoryName ? categoryName.toLowerCase() : '';

    if (name.includes('restaurant')) {
        IconComponent = Utensils;
        pinColor = '#f59e0b';
    } else if (name.includes('parc') || name.includes('park')) {
        IconComponent = TreePine;
        pinColor = '#10b981';
    } else if (name.includes('cafenea') || name.includes('cafe')) {
        IconComponent = Coffee;
        pinColor = '#8b5cf6';
    } else if (name.includes('muzeu') || name.includes('museum')) {
        IconComponent = Landmark;
        pinColor = '#ef4444';
    } else if (name.includes('bar')) {
        IconComponent = Wine;
        pinColor = '#ec4899';
    } else if (name.includes('patiserie') || name.includes('bakery')) {
        IconComponent = Cookie;
        pinColor = '#f97316';
    }

    const iconHtml = renderToString(<IconComponent color={pinColor} size={18} />);

    return L.divIcon({
        html: `
            <div style="
                background-color: white;
                border-radius: 50%;
                padding: 6px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid ${pinColor};
            ">
                ${iconHtml}
            </div>
        `,
        className: 'custom-poi-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
};

const PoiMarker = ({ location, onSelect }) => {
    const categoryName = location.category?.name || 'General';
    const customIcon = createCustomIcon(categoryName);

    return (
        <Marker
            position={[location.latitude, location.longitude]}
            icon={customIcon}
            eventHandlers={{
                click: () => onSelect(location)
            }}
        >
            <Popup>
                <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>
                        {location.name}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#64748b' }}>
                        {categoryName}
                    </p>
                    {location.rating > 0 && (
                        <div style={{
                            background: '#fef3c7',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            color: '#d97706',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                        }}>
                            ★ {location.rating}
                        </div>
                    )}
                </div>
            </Popup>
        </Marker>
    );
};

export default PoiMarker;