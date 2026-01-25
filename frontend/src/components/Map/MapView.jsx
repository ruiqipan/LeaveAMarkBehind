import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useProximity } from '../../hooks/useProximity';
import { getMarksInBounds } from '../../services/marksService';
import { PROXIMITY_RADIUS } from '../../utils/geofencing';
import MarkBubble from './MarkBubble';
import './MapView.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 37.7749, // San Francisco
  lng: -122.4194,
};

// Custom map styles for a clean, modern look
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }, { lightness: 17 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 18 }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 16 }],
  },
];

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
  draggable: true,
  scrollwheel: true,
  disableDoubleClickZoom: false,
  styles: mapStyles,
};

const MapView = ({ onMarkClick, onCreateClick }) => {
  const [marks, setMarks] = useState([]);
  const [showInfoBubble, setShowInfoBubble] = useState(false);
  const mapRef = useRef(null);

  // Static initial values - don't update these to keep map draggable
  const initialMapCenter = useRef(defaultCenter);
  const initialMapZoom = useRef(15);

  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  const { nearbyMarks, hasNearbyMarks } = useProximity(location, marks);

  // Debug logging
  useEffect(() => {
    console.log('Marks state:', marks);
    console.log('Nearby marks:', nearbyMarks);
  }, [marks, nearbyMarks]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Pan to user location when first obtained
  useEffect(() => {
    if (location && !locationLoading && mapRef.current) {
      const newCenter = {
        lat: location.latitude,
        lng: location.longitude,
      };

      // Only pan to location once when first loaded
      if (initialMapCenter.current === defaultCenter) {
        initialMapCenter.current = newCenter;
        mapRef.current.panTo(newCenter);
      }
    }
  }, [location, locationLoading]);

  // Fetch marks when map bounds change
  const handleMapIdle = useCallback(async () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    try {
      const fetchedMarks = await getMarksInBounds(
        ne.lat(),
        sw.lat(),
        ne.lng(),
        sw.lng()
      );
      console.log('Fetched marks:', fetchedMarks);
      setMarks(fetchedMarks);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  }, []);

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Recenter map on user location
  const handleRecenter = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.panTo({
        lat: location.latitude,
        lng: location.longitude,
      });
      mapRef.current.setZoom(16);
    }
  }, [location]);

  const handleMarkerClick = useCallback(
    (mark) => {
      console.log('Mark clicked:', mark);

      if (!location) {
        alert('Waiting for your location...');
        return;
      }

      const isNearby = nearbyMarks.some((m) => m.id === mark.id);
      console.log('Is nearby:', isNearby);

      if (isNearby) {
        console.log('Opening mark display');
        onMarkClick?.(mark);
      } else {
        alert(`You need to be within ${PROXIMITY_RADIUS}m to view this mark.`);
      }
    },
    [location, nearbyMarks, onMarkClick]
  );

  const handleMapClick = useCallback(
    (e) => {
      // Click on map (not on marker) - could be used for creating new marks
      if (location && onCreateClick) {
        onCreateClick({
          lat: location.latitude,
          lng: location.longitude,
        });
      }
    },
    [location, onCreateClick]
  );

  if (loadError) {
    return (
      <div className="map-error">
        <h2>Error loading maps</h2>
        <p>Please check your Google Maps API key</p>
      </div>
    );
  }

  if (!isLoaded || locationLoading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>{locationLoading ? 'Getting your location...' : 'Loading map...'}</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="map-error">
        <h2>Location access required</h2>
        <p>{locationError.message}</p>
        <p>Please enable location services to use this app.</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialMapCenter.current}
        zoom={initialMapZoom.current}
        options={mapOptions}
        onLoad={handleLoad}
        onIdle={handleMapIdle}
      >
        {/* User location marker */}
        {location && (
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Your location"
            zIndex={1000}
          />
        )}

        {/* Mark bubbles */}
        {marks.map((mark) => {
          const isNearby = nearbyMarks.some((m) => m.id === mark.id);
          return (
            <MarkBubble
              key={mark.id}
              mark={mark}
              isNearby={isNearby}
              onClick={() => handleMarkerClick(mark)}
            />
          );
        })}
      </GoogleMap>



      {/* Map controls */}
      <div className="map-controls">
        <button
          className="map-control-btn"
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom();
              mapRef.current.setZoom(Math.min(currentZoom + 1, 20));
            }
          }}
          title="Zoom in"
        >
          <span>+</span>
        </button>
        <button
          className="map-control-btn"
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom();
              mapRef.current.setZoom(Math.max(currentZoom - 1, 10));
            }
          }}
          title="Zoom out"
        >
          <span>−</span>
        </button>
        <button
          className="map-control-btn recenter-btn"
          onClick={handleRecenter}
          title="Center on my location"
        >
          <span className="recenter-icon">◎</span>
        </button>
      </div>

      {/* Info button */}
      <button 
        className="map-info-btn"
        onClick={() => setShowInfoBubble(true)}
        aria-label="More information"
        title="How it works"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </button>

      {/* Info Bubble Modal */}
      {showInfoBubble && (
        <div className="map-info-overlay" onClick={() => setShowInfoBubble(false)}>
          <div className="map-info-bubble" onClick={(e) => e.stopPropagation()}>
            <button 
              className="map-info-bubble-close"
              onClick={() => setShowInfoBubble(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="map-info-bubble-header">
              <span className="map-info-bubble-icon">🗺️</span>
              <h3>How to Use the Map</h3>
            </div>
            
            <div className="map-info-bubble-content">
              <div className="map-info-section">
                <div className="map-info-item">
                  <span className="map-info-item-icon">📍</span>
                  <div>
                    <h4>Discover Marks</h4>
                    <p>Marks are location-based messages left by others. They appear as bubbles on the map.</p>
                  </div>
                </div>
                
                <div className="map-info-item">
                  <span className="map-info-item-icon">🚶</span>
                  <div>
                    <h4>Get Close to View</h4>
                    <p>You must be within <strong>75 meters</strong> of a mark to view its content. Walk towards the bubbles!</p>
                  </div>
                </div>
                
                <div className="map-info-item">
                  <span className="map-info-item-icon">✨</span>
                  <div>
                    <h4>Leave Your Mark</h4>
                    <p>Tap the <strong>purple button</strong> at the bottom to leave a text, photo, drawing, or audio mark at your current location.</p>
                  </div>
                </div>
                
                <div className="map-info-item">
                  <span className="map-info-item-icon">⏳</span>
                  <div>
                    <h4>Ephemeral Content</h4>
                    <p>Marks are temporary and will disappear after some time, keeping the experience fresh and in-the-moment.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="map-info-bubble-dismiss"
              onClick={() => setShowInfoBubble(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Marks count indicator */}
      {marks.length > 0 && (
        <div className="marks-count-hint">
          <span className="hint-icon">📍</span>
          <span className="hint-text">{marks.length} marks found ({nearbyMarks.length} nearby)</span>
        </div>
      )}

      {/* Distance hint for distant marks */}
      {marks.length > 0 && nearbyMarks.length === 0 && (
        <div className="distance-hint">
          <span className="distance-hint-icon">🚶</span>
          <span className="distance-hint-title">Get closer to view</span>
          <span className="distance-hint-subtitle">Go towards the marks on the map</span>
        </div>
      )}
    </div>
  );
};

export default MapView;
