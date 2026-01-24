import { OverlayView } from '@react-google-maps/api';
import './MarkCluster.css';

/**
 * Cluster component for grouping multiple nearby marks
 * Shows count and preview of mark types in the cluster
 */
const MarkCluster = ({ marks, center, isNearby, onClick }) => {
  const position = { lat: center.lat, lng: center.lng };

  // Count marks by type
  const typeCounts = marks.reduce((acc, mark) => {
    acc[mark.type] = (acc[mark.type] || 0) + 1;
    return acc;
  }, {});

  // Get dominant type for styling
  const dominantType = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'text';

  // Find first image mark for thumbnail
  const imageMark = marks.find((m) => m.type === 'image');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      default: return '📍';
    }
  };

  const clusterClasses = [
    'mark-cluster',
    `cluster-${dominantType}`,
    isNearby ? 'nearby' : 'distant',
  ].join(' ');

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
    >
      <div className={clusterClasses} onClick={onClick}>
        <div className="cluster-content">
          {imageMark ? (
            <img src={imageMark.content} alt="" className="cluster-thumbnail" />
          ) : (
            <span className="cluster-icon">{getTypeIcon(dominantType)}</span>
          )}
          <div className="cluster-count">{marks.length}</div>
        </div>

        {/* Type indicators */}
        <div className="cluster-types">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className={`type-indicator type-${type}`}>
              <span>{getTypeIcon(type)}</span>
              {count > 1 && <span className="type-count">{count}</span>}
            </div>
          ))}
        </div>

        {/* Pulse for nearby clusters */}
        {isNearby && <div className="cluster-pulse"></div>}
      </div>
    </OverlayView>
  );
};

export default MarkCluster;
