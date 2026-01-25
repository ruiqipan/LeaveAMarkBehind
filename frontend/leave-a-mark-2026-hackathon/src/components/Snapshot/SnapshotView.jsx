import { useState, useEffect } from 'react';
import { getSnapshotForLocation, getMarksByIds } from '../../services/marksService';
import { getLocationClusterId } from '../../utils/geofencing';
import TopTextList from './TopTextList';
import TopAudioList from './TopAudioList';
import ImageGrid from './ImageGrid';
import './SnapshotView.css';

const SnapshotView = ({ location, onClose, onMarkClick }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [textMarks, setTextMarks] = useState([]);
  const [audioMarks, setAudioMarks] = useState([]);
  const [imageMarks, setImageMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      loadSnapshot();
    }
  }, [location]);

  const loadSnapshot = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get location cluster ID
      const clusterId = getLocationClusterId(location.latitude, location.longitude);

      // Fetch snapshot for this location
      const snapshotData = await getSnapshotForLocation(clusterId);

      if (!snapshotData) {
        setError('No snapshot available for this location yet');
        setLoading(false);
        return;
      }

      setSnapshot(snapshotData);

      // Fetch actual mark data
      const [texts, audios, images] = await Promise.all([
        getMarksByIds(snapshotData.top_texts || []),
        getMarksByIds(snapshotData.top_audios || []),
        getMarksByIds(snapshotData.images || []),
      ]);

      // Preserve order from snapshot
      const orderedTexts = (snapshotData.top_texts || [])
        .map((id) => texts.find((m) => m.id === id))
        .filter(Boolean);

      const orderedAudios = (snapshotData.top_audios || [])
        .map((id) => audios.find((m) => m.id === id))
        .filter(Boolean);

      setTextMarks(orderedTexts);
      setAudioMarks(orderedAudios);
      setImageMarks(images);

      setLoading(false);
    } catch (err) {
      console.error('Error loading snapshot:', err);
      setError('Failed to load snapshot');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="snapshot-overlay">
        <div className="snapshot-container">
          <div className="snapshot-loading">
            <div className="spinner"></div>
            <p>Loading snapshot...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="snapshot-overlay">
        <div className="snapshot-container">
          <div className="snapshot-error">
            <h2>📸 No Snapshot Available</h2>
            <p>{error || 'No snapshot found for this location'}</p>
            <p className="error-hint">
              Snapshots are created daily at midnight for locations with activity.
            </p>
            <button onClick={onClose} className="btn-close">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasContent =
    textMarks.length > 0 || audioMarks.length > 0 || imageMarks.length > 0;

  return (
    <div className="snapshot-overlay" onClick={onClose}>
      <div className="snapshot-container" onClick={(e) => e.stopPropagation()}>
        <div className="snapshot-header">
          <div className="snapshot-title">
            <span className="snapshot-icon">📸</span>
            <div>
              <h2>Daily Snapshot</h2>
              <p className="snapshot-date">{formatDate(snapshot.snapshot_date)}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-icon">
            ✕
          </button>
        </div>

        <div className="snapshot-meta">
          <span className="expiry-badge">
            ⏱️ {getTimeRemaining(snapshot.expires_at)}
          </span>
        </div>

        {!hasContent ? (
          <div className="snapshot-empty">
            <p>No content captured in this snapshot</p>
          </div>
        ) : (
          <div className="snapshot-content">
            {/* Top Text Marks */}
            {textMarks.length > 0 && (
              <section className="snapshot-section">
                <h3 className="section-title">
                  <span className="section-icon">📝</span>
                  Top Text Marks
                </h3>
                <TopTextList marks={textMarks} onMarkClick={onMarkClick} />
              </section>
            )}

            {/* Top Audio Marks */}
            {audioMarks.length > 0 && (
              <section className="snapshot-section">
                <h3 className="section-title">
                  <span className="section-icon">🎧</span>
                  Top Audio Marks
                </h3>
                <TopAudioList marks={audioMarks} onMarkClick={onMarkClick} />
              </section>
            )}

            {/* Image Grid */}
            {imageMarks.length > 0 && (
              <section className="snapshot-section">
                <h3 className="section-title">
                  <span className="section-icon">🖼️</span>
                  Images ({imageMarks.length})
                </h3>
                <ImageGrid marks={imageMarks} onMarkClick={onMarkClick} />
              </section>
            )}
          </div>
        )}

        <div className="snapshot-footer">
          <p>
            This snapshot captures the most engaging content from yesterday at this
            location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnapshotView;
