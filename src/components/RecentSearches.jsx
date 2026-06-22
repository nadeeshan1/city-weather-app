import { FaHistory } from 'react-icons/fa';
import './RecentSearches.css';

const RecentSearches = ({ searches, onSelect, onClear }) => {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="recent-searches">
      <div className="recent-header">
        <h3><FaHistory /> Recent Searches</h3>
        <button onClick={onClear} className="clear-button">
          Clear All
        </button>
      </div>
      <div className="recent-list">
        {searches.map((city, index) => (
          <button
            key={index}
            className="recent-item"
            onClick={() => onSelect(city)}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;