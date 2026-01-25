import { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import MapView from '../components/Map/MapView';
import MarkDisplay from '../components/Discovery/MarkDisplay';
import CreateMark from '../components/Create/CreateMark';
import FloatingActionButton from '../components/FAB/FloatingActionButton';
import { useToast, ToastContainer } from '../components/Feedback/Toast';
import '../App.css';

const HomePage = () => {
  const [selectedMark, setSelectedMark] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [parentMark, setParentMark] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();

  const { location } = useGeolocation();

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
    showToast('Your mark has been dropped! 📍', 'success');
  };

  return (
    <>
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Map View */}
      <MapView
        onMarkClick={handleMarkClick}
        onCreateClick={handleCreateClick}
      />

      {/* Floating Action Button - Leave a Mark */}
      <FloatingActionButton 
        onClick={handleCreateClick}
        disabled={!location}
      />

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
    </>
  );
};

export default HomePage;
