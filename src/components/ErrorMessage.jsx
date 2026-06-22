import { FaExclamationTriangle } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-card">
        <FaExclamationTriangle className="error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;