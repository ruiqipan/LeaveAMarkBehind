import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const handleNavClick = () => {
    // Haptic feedback on navigation
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  return (
    <nav className="bottom-nav">
      <Link
        to="/"
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <div className="nav-icon-wrapper">
          <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="currentColor"
            />
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        </div>
        <span className="nav-label">Explore</span>
        {location.pathname === '/' && <span className="nav-indicator"></span>}
      </Link>
      <Link
        to="/snapshot"
        className={`nav-item ${location.pathname === '/snapshot' ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <div className="nav-icon-wrapper">
          <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" fill="currentColor"/>
            <circle cx="12" cy="13" r="4" fill="white"/>
            <circle cx="12" cy="13" r="2" fill="currentColor"/>
            <rect x="15" y="8" width="3" height="2" rx="0.5" fill="white" opacity="0.7"/>
          </svg>
        </div>
        <span className="nav-label">Snapshot</span>
        {location.pathname === '/snapshot' && <span className="nav-indicator"></span>}
      </Link>
    </nav>
  );
};

export default BottomNav;
