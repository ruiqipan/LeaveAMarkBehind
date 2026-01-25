import { useEffect, useState } from "react";
import { useGeolocation } from './hooks/useGeolocation';
import MapView from './components/Map/MapView';
import MarkDisplay from './components/Discovery/MarkDisplay';
import CreateMark from './components/Create/CreateMark';
import SnapshotView from './components/Snapshot/SnapshotView';

import './App.css';

function App() {
  const [selectedMark, setSelectedMark] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [parentMark, setParentMark] = useState(null);

  const { location } = useGeolocation();

  useEffect(() => {
    console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("ANON KEY EXISTS:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log("MAPS KEY EXISTS:", !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log("MAPS KEY PREFIX:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.slice(0, 6));
  }, []);


  const handleMarkClick = (mark) => {
    setSelectedMark(mark);
  };

  const handleCreateClick = () => {
    setParentMark(null);
    setShowCreateModal(true);
  };

  const handleAddToMark = (mark) => {
    setSelectedMark(null);
    setParentMark(mark);
    setShowCreateModal(true);
  };

  const handleCloseMarkDisplay = () => {
    setSelectedMark(null);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setParentMark(null);
  };

  const handleMarkCreated = (newMark) => {
    console.log('Mark created:', newMark);
    // Optionally refresh the map or show success message
  };

  const handleSnapshotClick = () => {
    setShowSnapshotModal(true);
  };

  const handleCloseSnapshot = () => {
    setShowSnapshotModal(false);
  };

  return (
    <div className="app">
      {/* Main Map View */}
      <MapView
        onMarkClick={handleMarkClick}
        onCreateClick={handleCreateClick}
      />

      {/* Floating Action Buttons */}
      <div className="fab-container">
        <button
          className="fab fab-snapshot"
          onClick={handleSnapshotClick}
          title="View Daily Snapshot"
          disabled={!location}
        >
          📸
        </button>
        <button
          className="fab fab-create"
          onClick={handleCreateClick}
          title="Create New Mark"
          disabled={!location}
        >
          ➕
        </button>
      </div>

      {/* Modals */}
      {selectedMark && (
        <MarkDisplay
          mark={selectedMark}
          location={location}
          onClose={handleCloseMarkDisplay}
          onAddTo={handleAddToMark}
        />
      )}

      {showCreateModal && (
        <CreateMark
          location={location}
          parentMark={parentMark}
          onClose={handleCloseCreate}
          onSuccess={handleMarkCreated}
        />
      )}

      {showSnapshotModal && location && (
        <SnapshotView
          location={location}
          onClose={handleCloseSnapshot}
          onMarkClick={handleMarkClick}
        />
      )}
    </div>
  );
}

export default App;
