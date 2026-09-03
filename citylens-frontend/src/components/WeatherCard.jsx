import WeatherIcon from './WeatherIcon';
import './WeatherCard.css';

const WeatherCard = ({ weather, address, isFullscreen }) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + weather.timezoneOffset * 1000);
    const timeStr = localTime.toTimeString().slice(0, 5);

    return (
        <div
            className={`context-card animate-fade-in ${weather.isRaining ? 'rainy' : weather.isClear ? 'sunny' : 'cloudy'}`}
            style={{ top: isFullscreen ? '90px' : '16px' }}
        >
            <div className="weather-info">
                <div className="weather-icon">
                    <WeatherIcon
                        weatherType={weather.condition}
                        isCurrentlyRaining={weather.isRaining}
                        localHour={localTime.getHours()}
                    />
                </div>
                <div className="weather-text">
                    <div className="weather-temp-row">
                        <span className="temp-big">{weather.temp}°</span>
                        <span className="weather-condition">{weather.condition}</span>
                    </div>
                    <p className="address-text">{address} · {timeStr}</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;