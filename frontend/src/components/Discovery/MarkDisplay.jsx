import { useState, useEffect, useRef } from 'react';
import {
  getMarksAtLocation,
  recordMarkView,
  getMarkThread,
  updateCanvasContent,
  uploadCanvasImage,
} from '../../services/marksService';
import { selectMarkWithRecency } from '../../services/antiViralAlgorithm';
import { formatDistance } from '../../utils/geofencing';
import MarkActions from './MarkActions';
import CanvasEditor from '../Create/CanvasEditor';
import './MarkDisplay.css';

const MarkDisplay = ({ location, mark: initialMark, onClose, onAddTo, onViewThread }) => {
  const [currentMark, setCurrentMark] = useState(initialMark);
  const [allMarks, setAllMarks] = useState([]);
  const [loading, setLoading] = useState(!initialMark);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState([]);
  const [showThread, setShowThread] = useState(false);
  const [isEditingCanvas, setIsEditingCanvas] = useState(false);
  const [canvasData, setCanvasData] = useState(null);
  const [savingCanvas, setSavingCanvas] = useState(false);

  // Drag to dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const cardRef = useRef(null);

  // Handle drag to dismiss
  const handleDragStart = (e) => {
    // Only allow drag from the drag handle area
    if (e.target.closest('.mark-body') || e.target.closest('.mark-actions') || e.target.closest('.thread-list')) {
      return;
    }
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = clientY - dragStartY.current;
    // Only allow dragging down
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If dragged more than 120px, close the modal
    if (dragY > 120) {
      onClose();
    } else {
      // Snap back
      setDragY(0);
    }
  };

  // Add touch event listeners
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMove = (e) => {
      if (isDragging && dragY > 0) {
        // Prevent scroll while dragging
        e.preventDefault();
      }
      handleDragMove(e);
    };

    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      card.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, dragY]);

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

  const handleEditCanvas = () => {
    setCanvasData({ json: currentMark.content, png: null });
    setIsEditingCanvas(true);
  };

  const handleCanvasChange = (data) => {
    // data is now { json, png }
    setCanvasData(data);
  };

  const handleSaveCanvas = async () => {
    if (!canvasData || !canvasData.json) return;

    setSavingCanvas(true);
    try {
      // Upload new PNG thumbnail if available
      let newImageUrl = currentMark.image_url;
      if (canvasData.png) {
        newImageUrl = await uploadCanvasImage(canvasData.png);
      }

      const updated = await updateCanvasContent(currentMark.id, canvasData.json, newImageUrl);
      setCurrentMark(updated);
      setIsEditingCanvas(false);
    } catch (err) {
      console.error('Error saving canvas:', err);
      alert('Failed to save canvas');
    } finally {
      setSavingCanvas(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingCanvas(false);
    setCanvasData(null);
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

      case 'canvas':
        return (
          <div className="mark-content-canvas">
            {isEditingCanvas ? (
              <div className="canvas-edit-container">
                <CanvasEditor
                  initialData={canvasData?.json || mark.content}
                  onChange={handleCanvasChange}
                />
                <div className="canvas-edit-actions">
                  <button
                    onClick={handleCancelEdit}
                    className="btn-cancel"
                    disabled={savingCanvas}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCanvas}
                    className="btn-save"
                    disabled={savingCanvas}
                  >
                    {savingCanvas ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="canvas-view-container">
                {/* Show PNG thumbnail if available for quick display */}
                {mark.image_url ? (
                  <img
                    src={mark.image_url}
                    alt="Canvas drawing"
                    className="canvas-thumbnail"
                  />
                ) : (
                  <CanvasEditor initialData={mark.content} readOnly />
                )}
                <button onClick={handleEditCanvas} className="btn-edit-canvas">
                  Add to Canvas
                </button>
              </div>
            )}
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

  // Calculate opacity based on drag distance
  const overlayOpacity = isDragging ? Math.max(0.3, 1 - dragY / 300) : 1;

  return (
    <div 
      className="mark-display-overlay" 
      onClick={onClose}
      style={{ opacity: overlayOpacity }}
    >
      <div 
        ref={cardRef}
        className={`mark-display-card ${isDragging ? 'dragging' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        style={{ 
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Drag handle indicator */}
        <div className="drag-handle-area">
          <div className="drag-handle"></div>
        </div>

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
