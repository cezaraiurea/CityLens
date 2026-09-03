import { LocateFixed } from 'lucide-react';
import './LocateMe.css';

const LocateMe = ({ onLocate }) => {

    const handleLocateClick = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    onLocate([pos.coords.latitude, pos.coords.longitude]);
                },
                (error) => {
                    console.error("Error finding you:", error);
                    alert("Could not access your live location.");
                }
            );
        }
    };

    return (
        <button
            className="icon-btn locate-me-btn"
            onClick={handleLocateClick}
            title="Return to my location"
        >
            <LocateFixed size={18} />
        </button>
    );
};

export default LocateMe;