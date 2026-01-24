import './TopTextList.css';

const TopTextList = ({ marks, onMarkClick }) => {
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

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="top-text-list">
      {marks.map((mark, index) => (
        <div
          key={mark.id}
          className="text-item"
          onClick={() => onMarkClick?.(mark)}
        >
          <div className="text-rank">{index + 1}</div>
          <div className="text-content">
            <p className="text-body">{truncateText(mark.content)}</p>
            <div className="text-meta">
              <span className="text-time">{timeAgo(mark.created_at)}</span>
              <div className="text-stats">
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopTextList;
