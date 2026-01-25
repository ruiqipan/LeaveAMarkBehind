import { useState } from 'react';
import './ImageGrid.css';

const ImageGrid = ({ marks, onMarkClick }) => {
  const [loadedImages, setLoadedImages] = useState({});

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleImageLoad = (markId) => {
    setLoadedImages(prev => ({ ...prev, [markId]: true }));
  };

  const handleImageError = (markId) => {
    // Still mark as loaded to remove placeholder and show fallback state
    setLoadedImages(prev => ({ ...prev, [markId]: true }));
  };

  // Split marks into columns for masonry effect
  // Track original index for lazy loading decision
  const columns = [[], []];
  marks.forEach((mark, index) => {
    columns[index % 2].push({ ...mark, originalIndex: index });
  });

  return (
    <div className="image-masonry">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="masonry-column">
          {column.map((mark) => (
            <div
              key={mark.id}
              className={`image-grid-item ${loadedImages[mark.id] ? 'loaded' : ''}`}
              onClick={() => onMarkClick?.(mark)}
            >
              <div className="image-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <img 
                src={mark.content} 
                alt="Mark" 
                loading={mark.originalIndex < 4 ? "eager" : "lazy"}
                onLoad={() => handleImageLoad(mark.id)}
                onError={() => handleImageError(mark.id)}
              />
              <div className="image-overlay">
                <div className="image-stats">
                  <span className="stat">
                    <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    {formatNumber(mark.view_count || 0)}
                  </span>
                  <span className="stat">
                    <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {formatNumber(mark.add_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
