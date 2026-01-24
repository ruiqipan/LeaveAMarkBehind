import { Marker } from '@react-google-maps/api';

/**
 * Custom marker component for displaying marks on the map
 * Shows different styles for nearby vs distant marks
 */
const LocationMarker = ({ mark, isNearby, onClick }) => {
  // Different marker styles based on proximity and type
  const getMarkerIcon = () => {
    let fillColor;

    // Color based on mark type
    switch (mark.type) {
      case 'text':
        fillColor = '#FF6B6B'; // Red for text
        break;
      case 'image':
        fillColor = '#4ECDC4'; // Teal for images
        break;
      case 'audio':
        fillColor = '#FFE66D'; // Yellow for audio
        break;
      default:
        fillColor = '#95E1D3'; // Default green
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: isNearby ? 12 : 8,
      fillColor: fillColor,
      fillOpacity: isNearby ? 0.9 : 0.6,
      strokeColor: isNearby ? '#ffffff' : fillColor,
      strokeWeight: isNearby ? 3 : 1,
    };
  };

  const getMarkerLabel = () => {
    if (!isNearby) return null;

    // Show first letter of type when nearby
    return {
      text: mark.type.charAt(0).toUpperCase(),
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: 'bold',
    };
  };

  return (
    <Marker
      position={{ lat: mark.latitude, lng: mark.longitude }}
      icon={getMarkerIcon()}
      label={getMarkerLabel()}
      onClick={onClick}
      title={isNearby ? 'Click to view' : 'Get closer to view'}
      animation={isNearby ? google.maps.Animation.BOUNCE : null}
      zIndex={isNearby ? 1000 : 100}
    />
  );
};

export default LocationMarker;
