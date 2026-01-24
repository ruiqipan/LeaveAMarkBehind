import { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import './MarkBubble.css';

/**
 * Custom bubble marker component for displaying marks on the map
 * Shows thumbnail previews for images, icons for text/audio
 */
const MarkBubble = ({ mark, isNearby, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get overlay position
  const position = { lat: mark.latitude, lng: mark.longitude };

  // Determine if mark is recent (created in last 2 hours)
  const isRecent = () => {
    const created = new Date(mark.created_at).getTime();
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    return created > twoHoursAgo;
  };

  // Get type-specific icon
  const getTypeIcon = () => {
    switch (mark.type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      default:
        return '📍';
    }
  };

  // Get type-specific color class
  const getTypeClass = () => {
    switch (mark.type) {
      case 'text':
        return 'bubble-text';
      case 'image':
        return 'bubble-image';
      case 'audio':
        return 'bubble-audio';
      default:
        return '';
    }
  };

  // Get thumbnail content based on mark type
  const renderThumbnail = () => {
    if (mark.type === 'image' && !imageError) {
      return (
        <div className="bubble-thumbnail">
          <img
            src={mark.content}
            alt=""
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={imageLoaded ? 'loaded' : ''}
          />
          {!imageLoaded && (
            <div className="thumbnail-placeholder">
              <span className="placeholder-icon">🖼️</span>
            </div>
          )}
        </div>
      );
    }

    if (mark.type === 'text') {
      // Show text preview (first few characters)
      const preview = mark.content.substring(0, 30);
      return (
        <div className="bubble-text-preview">
          <span className="text-snippet">{preview}{mark.content.length > 30 ? '...' : ''}</span>
        </div>
      );
    }

    // Audio or fallback - show icon
    return (
      <div className="bubble-icon-container">
        <span className="bubble-type-icon">{getTypeIcon()}</span>
        {mark.type === 'audio' && (
          <div className="audio-wave">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    );
  };

  const bubbleClasses = [
    'mark-bubble',
    getTypeClass(),
    isNearby ? 'nearby' : 'distant',
    isRecent() ? 'recent' : '',
    mark.type === 'image' && imageLoaded ? 'has-image' : '',
  ].filter(Boolean).join(' ');

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height - 8, // Position above the point with stem
      })}
    >
      <div className={bubbleClasses} onClick={onClick}>
        <div className="bubble-content">
          {renderThumbnail()}
        </div>

        {/* Type indicator badge */}
        <div className="bubble-badge">
          <span>{getTypeIcon()}</span>
        </div>

        {/* View count indicator for popular marks */}
        {mark.view_count > 5 && isNearby && (
          <div className="bubble-views">
            <span className="views-icon">👁</span>
            <span className="views-count">{mark.view_count}</span>
          </div>
        )}

        {/* Thread indicator */}
        {mark.add_count > 0 && (
          <div className="bubble-thread">
            <span>+{mark.add_count}</span>
          </div>
        )}

        {/* Bubble stem/pointer */}
        <div className="bubble-stem"></div>

        {/* Pulse animation for nearby/recent marks */}
        {isNearby && isRecent() && (
          <div className="bubble-pulse"></div>
        )}
      </div>
    </OverlayView>
  );
};

export default MarkBubble;
