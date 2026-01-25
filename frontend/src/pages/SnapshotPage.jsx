import { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import SnapshotView from '../components/Snapshot/SnapshotView';
import MarkDisplay from '../components/Discovery/MarkDisplay';
import './SnapshotPage.css';

const SnapshotPage = () => {
  const [selectedMark, setSelectedMark] = useState(null);
  const { location, loading, error } = useGeolocation();

  const handleMarkClick = (mark) => {
    setSelectedMark(mark);
  };

  const handleCloseMarkDisplay = () => {
    setSelectedMark(null);
  };

  if (loading) {
    return (
      <div className="snapshot-page-loading">
        <div className="spinner"></div>
        <p>Getting your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="snapshot-page-error">
        <h2>Location access required</h2>
        <p>{error.message}</p>
        <p>Please enable location services to view snapshots.</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="snapshot-page-loading">
        <div className="spinner"></div>
        <p>Waiting for location...</p>
      </div>
    );
  }

  return (
    <div className="snapshot-page">
      <SnapshotView
        location={location}
        onMarkClick={handleMarkClick}
        embedded={true}
      />

      {/* Mark Display Modal */}
      {selectedMark && (
        <MarkDisplay
          mark={selectedMark}
          location={location}
          onClose={handleCloseMarkDisplay}
          onAddTo={() => {}}
        />
      )}
    </div>
  );
};

export default SnapshotPage;
