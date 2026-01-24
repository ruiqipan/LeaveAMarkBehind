import { useState, useEffect } from 'react';

/**
 * Custom hook for accessing browser geolocation
 * @param {object} options - Geolocation options
 * @returns {object} Location state and controls
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      setLoading(false);
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      defaultOptions
    );

    // Watch position for continuous updates
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(err);
      },
      defaultOptions
    );

    setWatchId(id);

    // Cleanup
    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []); // Empty dependency array - only run once

  const refresh = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      defaultOptions
    );
  };

  return {
    location,
    error,
    loading,
    refresh,
  };
};

export default useGeolocation;
