import './TopAudioList.css';

const TopAudioList = ({ marks, onMarkClick }) => {
  const timeAgo = (timestamp) => {
    const now = Date.now();
    const created = new Date(timestamp).getTime();
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="top-audio-list">
      {marks.map((mark, index) => (
        <div key={mark.id} className="audio-item">
          <div className="audio-rank">{index + 1}</div>
          <div className="audio-content">
            <audio controls src={mark.content} preload="metadata">
              Your browser does not support the audio element.
            </audio>
            <div className="audio-meta">
              <span className="audio-time">{timeAgo(mark.created_at)}</span>
              <div className="audio-stats">
                <span className="stat">
                  <span className="stat-icon">👁</span>
                  {mark.view_count || 0}
                </span>
                {mark.add_count > 0 && (
                  <span className="stat">
                    <span className="stat-icon">💬</span>
                    {mark.add_count}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onMarkClick?.(mark)}
              className="btn-view-details"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopAudioList;
