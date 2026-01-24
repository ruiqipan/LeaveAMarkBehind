import './ImageGrid.css';

const ImageGrid = ({ marks, onMarkClick }) => {
  return (
    <div className="image-grid">
      {marks.map((mark) => (
        <div
          key={mark.id}
          className="image-grid-item"
          onClick={() => onMarkClick?.(mark)}
        >
          <img src={mark.content} alt="Mark" loading="lazy" />
          <div className="image-overlay">
            <div className="image-stats">
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
      ))}
    </div>
  );
};

export default ImageGrid;
