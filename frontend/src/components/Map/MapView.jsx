import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useProximity } from '../../hooks/useProximity';
import { getMarksInBounds } from '../../services/marksService';
import { getBoundingBox, PROXIMITY_RADIUS } from '../../utils/geofencing';
import LocationMarker from './LocationMarker';
import './MapView.css';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 37.7749, // San Francisco
  lng: -122.4194,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const MapView = ({ onMarkClick, onCreateClick }) => {
  const [marks, setMarks] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(15);
  const mapRef = useRef(null);

  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  const { nearbyMarks, hasNearbyMarks } = useProximity(location, marks);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Update map center when user location is obtained
  useEffect(() => {
    if (location && !locationLoading) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
      });
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
      setMarks(fetchedMarks);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  }, []);

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMarkerClick = useCallback(
    (mark) => {
      if (!location) {
        alert('Waiting for your location...');
        return;
      }

      const isNearby = nearbyMarks.some((m) => m.id === mark.id);

      if (isNearby) {
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
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={handleLoad}
        onIdle={handleMapIdle}
        onClick={handleMapClick}
      >
        {/* User location marker */}
        {location && (
          <>
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              title="Your location"
            />
            {/* Proximity radius circle */}
            <Circle
              center={{ lat: location.latitude, lng: location.longitude }}
              radius={PROXIMITY_RADIUS}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Mark markers */}
        {marks.map((mark) => {
          const isNearby = nearbyMarks.some((m) => m.id === mark.id);
          return (
            <LocationMarker
              key={mark.id}
              mark={mark}
              isNearby={isNearby}
              onClick={() => handleMarkerClick(mark)}
            />
          );
        })}
      </GoogleMap>

      {/* Status indicator */}
      {hasNearbyMarks && (
        <div className="nearby-indicator">
          <span className="pulse"></span>
          {nearbyMarks.length} mark{nearbyMarks.length !== 1 ? 's' : ''} nearby
        </div>
      )}
    </div>
  );
};

export default MapView;
