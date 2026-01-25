import { useState, useEffect } from 'react';
import './FloatingActionButton.css';

const FAB_HINT_KEY = 'leave-a-mark-fab-hint-shown';

const FloatingActionButton = ({ onClick, disabled = false }) => {
  const [showHint, setShowHint] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Show hint for first-time users
    const hintShown = localStorage.getItem(FAB_HINT_KEY);
    if (!hintShown) {
      // Delay hint appearance for better UX
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClick = () => {
    if (disabled) return;
    
    // Dismiss hint on first click
    if (showHint) {
      setShowHint(false);
      localStorage.setItem(FAB_HINT_KEY, 'true');
    }
    
    // Haptic feedback on mobile (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  const handleDismissHint = (e) => {
    e.stopPropagation();
    setShowHint(false);
    localStorage.setItem(FAB_HINT_KEY, 'true');
  };

  return (
    <div className="fab-wrapper">
      {/* Tooltip hint for first-time users */}
      {showHint && (
        <div className="fab-hint" onClick={handleDismissHint}>
          <div className="fab-hint-content">
            <span className="fab-hint-icon">👋</span>
            <div className="fab-hint-text">
              <strong>Leave your mark!</strong>
              <span>Tap to drop a message here</span>
            </div>
          </div>
          <div className="fab-hint-arrow"></div>
        </div>
      )}

      {/* Main FAB button */}
      <button
        className={`fab-button ${disabled ? 'disabled' : ''} ${isPressed ? 'pressed' : ''} ${showHint ? 'has-hint' : ''}`}
        onClick={handleClick}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled}
        aria-label="Leave a mark at your current location"
      >
        {/* Drop pin icon */}
        <svg 
          className="fab-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
            fill="currentColor"
          />
          <circle 
            cx="12" 
            cy="9" 
            r="2.5" 
            fill="white"
          />
          {/* Plus sign inside */}
          <line 
            x1="12" 
            y1="7" 
            x2="12" 
            y2="11" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <line 
            x1="10" 
            y1="9" 
            x2="14" 
            y2="9" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>

        {/* Pulse rings for attention */}
        {!disabled && (
          <div className="fab-pulse-container">
            <div className="fab-pulse-ring"></div>
            <div className="fab-pulse-ring delay"></div>
          </div>
        )}
      </button>

      {/* Label that shows on hover/long-press */}
      <span className="fab-label">Leave a mark</span>
    </div>
  );
};

// Helper to reset hint (for testing)
export const resetFabHint = () => {
  localStorage.removeItem(FAB_HINT_KEY);
};

export default FloatingActionButton;
