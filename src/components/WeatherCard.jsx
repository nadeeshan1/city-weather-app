import { FaTemperatureHigh, FaWind, FaTint, FaCompress } from 'react-icons/fa';
import './WeatherCard.css';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  const {
    name,
    sys: { country },
    weather: weatherDetails,
    main: { temp, feels_like, humidity, pressure },
    wind: { speed },
  } = weather;

  const weatherIcon = weatherDetails[0].icon;
  const description = weatherDetails[0].description;
  const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@4x.png`;

  const getBackgroundClass = () => {
    const main = weatherDetails[0].main.toLowerCase();
    if (main.includes('clear')) return 'sunny';
    if (main.includes('cloud')) return 'cloudy';
    if (main.includes('rain')) return 'rainy';
    if (main.includes('snow')) return 'snowy';
    if (main.includes('thunderstorm')) return 'stormy';
    return 'default';
  };

  return (
    <div className={`weather-card ${getBackgroundClass()}`}>
      <div className="weather-header">
        <h2>{name}, {country}</h2>
        <p className="date">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div className="weather-main">
        <img src={iconUrl} alt={description} className="weather-icon" />
        <div className="temperature-container">
          <h1 className="temperature">{Math.round(temp)}°C</h1>
          <p className="description">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
          <p className="feels-like">Feels like {Math.round(feels_like)}°C</p>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <FaTemperatureHigh className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">{Math.round(feels_like)}°C</span>
          </div>
        </div>
        
        <div className="detail-item">
          <FaTint className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{humidity}%</span>
          </div>
        </div>
        
        <div className="detail-item">
          <FaWind className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">{speed} m/s</span>
          </div>
        </div>
        
        <div className="detail-item">
          <FaCompress className="detail-icon" />
          <div className="detail-info">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;