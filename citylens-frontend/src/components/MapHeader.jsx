import { Bell, User, Navigation } from 'lucide-react'; 
import SearchBar from './SearchBar';
import './MapHeader.css';

const MapHeader = ({ onProfile, onLocationFound }) => {
  return (
    <header className="map-header animate-fade-in">
      <div className="header-logo">
        <div className="logo-wrapper">
          <Navigation size={16} className="logo-icon-svg" />
        </div>
        <span className="logo-text">City<span className="logo-accent">Lens</span></span>
      </div> 

      <div className="header-search">
        <SearchBar onLocationFound={onLocationFound} />
      </div>

      <div className="header-actions">
        <button className="header-icon-btn" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="header-avatar" onClick={onProfile} title="Profile">
          <User size={18} />
        </button>
      </div>
      </header>
  );
};

export default MapHeader;