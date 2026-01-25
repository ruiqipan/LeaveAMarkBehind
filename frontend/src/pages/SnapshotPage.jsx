import { useState } from 'react';
import SnapshotView from '../components/Snapshot/SnapshotView';
import './SnapshotPage.css';

const SnapshotPage = () => {
  const [selectedMark, setSelectedMark] = useState(null);

  const handleMarkClick = (mark) => {
    setSelectedMark(mark);
  };

  const handleCloseMarkDisplay = () => {
    setSelectedMark(null);
  };

  return (
    <div className="snapshot-page">
      <SnapshotView
        onMarkClick={handleMarkClick}
        embedded={true}
      />

      {/* Mark Detail Modal */}
      {selectedMark && (
        <div className="mark-detail-modal" onClick={handleCloseMarkDisplay}>
          <div className="mark-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseMarkDisplay}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            {selectedMark.id?.startsWith('img-') || selectedMark.content?.includes('unsplash') || selectedMark.content?.includes('picsum') ? (
              // Image mark
              <div className="detail-image-container">
                <img src={selectedMark.content} alt="Mark" />
              </div>
            ) : selectedMark.id?.startsWith('audio-') || selectedMark.content?.includes('soundhelix') || selectedMark.title ? (
              // Audio mark
              <div className="detail-audio-container">
                <div className="detail-audio-icon">{selectedMark.category === 'music' ? '🎵' : '🔊'}</div>
                <h3>{selectedMark.title || 'Audio Mark'}</h3>
                <audio controls src={selectedMark.content}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              // Text mark
              <div className="detail-text-container">
                <div className="detail-text-icon">📝</div>
                <p className="detail-text-content">{selectedMark.content}</p>
              </div>
            )}
            
            <div className="detail-stats">
              <div className="detail-stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <span>{selectedMark.view_count || 0} views</span>
              </div>
              <div className="detail-stat reactions">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{selectedMark.add_count || 0} reactions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapshotPage;
