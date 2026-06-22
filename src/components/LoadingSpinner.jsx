import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Fetching weather data...</p>
    </div>
  );
};

export default LoadingSpinner;