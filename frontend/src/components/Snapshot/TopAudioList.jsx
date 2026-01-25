import { useState, useRef } from 'react';
import './TopAudioList.css';

const TopAudioList = ({ marks, onMarkClick }) => {
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState({});
  const audioRefs = useRef({});

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const created = new Date(timestamp).getTime();
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m`;
    }
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Medal/rank colors for top 3
  const getRankStyle = (index) => {
    const styles = [
      { background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#7B5800' }, // Gold
      { background: 'linear-gradient(135deg, #E8E8E8 0%, #B8B8B8 100%)', color: '#555' }, // Silver
      { background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', color: '#fff' }, // Bronze
    ];
    return styles[index] || { background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#fff' };
  };

  const handlePlayPause = (e, markId) => {
    e.stopPropagation();
    const audio = audioRefs.current[markId];
    
    if (!audio) return;
    
    if (playingId === markId) {
      audio.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing audio
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      audio.play();
      setPlayingId(markId);
    }
  };

  const handleTimeUpdate = (markId) => {
    const audio = audioRefs.current[markId];
    if (audio) {
      const progressPercent = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(prev => ({ ...prev, [markId]: progressPercent }));
    }
  };

  const handleEnded = (markId) => {
    setPlayingId(null);
    setProgress(prev => ({ ...prev, [markId]: 0 }));
  };

  return (
    <div className="top-audio-list">
      {marks.map((mark, index) => (
        <div 
          key={mark.id} 
          className="audio-item"
          onClick={() => onMarkClick?.(mark)}
        >
          <div
            className="audio-rank"
            style={getRankStyle(index)}
          >
            {index + 1}
          </div>
          
          <div className="audio-content">
            <div className="audio-header">
              <span className="audio-title">{mark.title || 'Audio Mark'}</span>
              <span className="audio-duration">{mark.duration || '0:00'}</span>
            </div>
            
            <div className="audio-player">
              <button
                className={`play-button ${playingId === mark.id ? 'playing' : ''}`}
                onClick={(e) => handlePlayPause(e, mark.id)}
              >
                {playingId === mark.id ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <div className="waveform-container">
                <div className="waveform-bars">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="waveform-bar"
                      style={{ 
                        height: `${Math.random() * 60 + 40}%`,
                        opacity: (progress[mark.id] || 0) > (i / 20) * 100 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                <div 
                  className="progress-overlay"
                  style={{ width: `${progress[mark.id] || 0}%` }}
                />
              </div>
              
              <audio
                ref={el => audioRefs.current[mark.id] = el}
                src={mark.content}
                onTimeUpdate={() => handleTimeUpdate(mark.id)}
                onEnded={() => handleEnded(mark.id)}
                preload="metadata"
              />
            </div>
            
            <div className="audio-meta">
              <span className="audio-time">{timeAgo(mark.created_at)}</span>
              <div className="audio-stats">
                <span className="stat">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  {formatNumber(mark.view_count || 0)}
                </span>
                <span className="stat stat-reactions">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {formatNumber(mark.add_count || 0)}
                </span>
              </div>
            </div>
          </div>
          
          <svg className="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default TopAudioList;
