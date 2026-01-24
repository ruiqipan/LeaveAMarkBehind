import { useState, useEffect } from 'react';
import {
  getMarksAtLocation,
  recordMarkView,
  getMarkThread,
} from '../../services/marksService';
import { selectMarkWithRecency } from '../../services/antiViralAlgorithm';
import { formatDistance } from '../../utils/geofencing';
import MarkActions from './MarkActions';
import './MarkDisplay.css';

const MarkDisplay = ({ location, mark: initialMark, onClose, onAddTo, onViewThread }) => {
  const [currentMark, setCurrentMark] = useState(initialMark);
  const [allMarks, setAllMarks] = useState([]);
  const [loading, setLoading] = useState(!initialMark);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState([]);
  const [showThread, setShowThread] = useState(false);

  useEffect(() => {
    if (initialMark) {
      // Mark was passed in, just record view and fetch thread if needed
      recordView(initialMark);
      if (initialMark.add_count > 0) {
        loadThread(initialMark.id);
      }
    } else if (location) {
      // No mark passed, fetch and select one at this location
      loadAndSelectMark();
    }
  }, [location, initialMark]);

  const loadAndSelectMark = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all marks at this location
      const marks = await getMarksAtLocation(location.latitude, location.longitude);

      if (marks.length === 0) {
        setError('No marks found at this location');
        setLoading(false);
        return;
      }

      setAllMarks(marks);

      // Use anti-viral algorithm to select a mark
      const selectedMark = selectMarkWithRecency(marks);

      setCurrentMark(selectedMark);
      await recordView(selectedMark);

      // Load thread if mark has replies
      if (selectedMark.add_count > 0) {
        await loadThread(selectedMark.id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading mark:', err);
      setError('Failed to load mark');
      setLoading(false);
    }
  };

  const recordView = async (mark) => {
    try {
      await recordMarkView(mark.id);
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  const loadThread = async (markId) => {
    try {
      const threadMarks = await getMarkThread(markId);
      setThread(threadMarks);
    } catch (err) {
      console.error('Error loading thread:', err);
    }
  };

  const handleViewAnother = async () => {
    if (allMarks.length <= 1) {
      alert('No other marks at this location');
      return;
    }

    // Filter out the current mark and select another
    const otherMarks = allMarks.filter((m) => m.id !== currentMark.id);
    const selectedMark = selectMarkWithRecency(otherMarks);

    setCurrentMark(selectedMark);
    await recordView(selectedMark);

    // Load thread if needed
    if (selectedMark.add_count > 0) {
      await loadThread(selectedMark.id);
    }
  };

  const handleToggleThread = () => {
    setShowThread(!showThread);
  };

  const handleAddTo = () => {
    onAddTo?.(currentMark);
  };

  const renderMarkContent = (mark) => {
    switch (mark.type) {
      case 'text':
        return (
          <div className="mark-content-text">
            <p>{mark.content}</p>
          </div>
        );

      case 'image':
        return (
          <div className="mark-content-image">
            <img src={mark.content} alt="Mark" loading="lazy" />
          </div>
        );

      case 'audio':
        return (
          <div className="mark-content-audio">
            <audio controls src={mark.content}>
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      default:
        return <p>Unsupported mark type</p>;
    }
  };

  if (loading) {
    return (
      <div className="mark-display-overlay">
        <div className="mark-display-card">
          <div className="mark-loading">
            <div className="spinner"></div>
            <p>Loading mark...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentMark) {
    return (
      <div className="mark-display-overlay">
        <div className="mark-display-card">
          <div className="mark-error">
            <p>{error || 'No mark available'}</p>
            <button onClick={onClose} className="btn-close">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const created = new Date(timestamp).getTime();
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  };

  return (
    <div className="mark-display-overlay" onClick={onClose}>
      <div className="mark-display-card" onClick={(e) => e.stopPropagation()}>
        <div className="mark-header">
          <div className="mark-meta">
            <span className={`mark-type-badge ${currentMark.type}`}>
              {currentMark.type}
            </span>
            <span className="mark-time">{timeAgo(currentMark.created_at)}</span>
          </div>
          <button onClick={onClose} className="btn-close-icon">
            ✕
          </button>
        </div>

        <div className="mark-body">
          {renderMarkContent(currentMark)}
        </div>

        <div className="mark-stats">
          <span className="stat">
            <span className="stat-icon">👁</span>
            {currentMark.view_count || 0}
          </span>
          {currentMark.add_count > 0 && (
            <span className="stat">
              <span className="stat-icon">💬</span>
              {currentMark.add_count}
            </span>
          )}
        </div>

        {/* Thread section */}
        {currentMark.add_count > 0 && (
          <div className="mark-thread-section">
            <button onClick={handleToggleThread} className="btn-thread">
              {showThread ? 'Hide' : 'View'} Thread ({currentMark.add_count})
            </button>

            {showThread && thread.length > 0 && (
              <div className="thread-list">
                {thread
                  .filter((m) => m.id !== currentMark.id)
                  .map((threadMark) => (
                    <div key={threadMark.id} className="thread-item">
                      <div className="thread-meta">
                        <span className={`mark-type-badge ${threadMark.type}`}>
                          {threadMark.type}
                        </span>
                        <span className="mark-time">{timeAgo(threadMark.created_at)}</span>
                      </div>
                      {renderMarkContent(threadMark)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <MarkActions
          onAddTo={handleAddTo}
          onViewAnother={allMarks.length > 1 ? handleViewAnother : null}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default MarkDisplay;
