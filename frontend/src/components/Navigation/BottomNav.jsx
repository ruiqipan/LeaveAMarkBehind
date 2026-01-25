import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link
        to="/"
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Map</span>
      </Link>
      <Link
        to="/snapshot"
        className={`nav-item ${location.pathname === '/snapshot' ? 'active' : ''}`}
      >
        <span className="nav-icon">📸</span>
        <span className="nav-label">Snapshot</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
