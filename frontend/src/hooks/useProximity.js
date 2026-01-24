import { useState, useEffect, useCallback } from 'react';
import { haversineDistance, PROXIMITY_RADIUS } from '../utils/geofencing';

/**
 * Custom hook for detecting proximity to marks
 * @param {object} userLocation - User's current location {latitude, longitude}
 * @param {Array} marks - Array of marks to check proximity against
 * @returns {object} Proximity state and nearby marks
 */
export const useProximity = (userLocation, marks = []) => {
  const [nearbyMarks, setNearbyMarks] = useState([]);
  const [closestMark, setClosestMark] = useState(null);

  const checkProximity = useCallback(() => {
    if (!userLocation || !marks || marks.length === 0) {
      setNearbyMarks([]);
      setClosestMark(null);
      return;
    }

    const nearby = marks
      .map((mark) => {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          mark.latitude,
          mark.longitude
        );

        return {
          ...mark,
          distance,
          isNearby: distance <= PROXIMITY_RADIUS,
        };
      })
      .filter((mark) => mark.isNearby)
      .sort((a, b) => a.distance - b.distance);

    setNearbyMarks(nearby);
    setClosestMark(nearby.length > 0 ? nearby[0] : null);
  }, [userLocation, marks]);

  useEffect(() => {
    checkProximity();
  }, [checkProximity]);

  const isNearMark = useCallback(
    (markId) => {
      return nearbyMarks.some((mark) => mark.id === markId);
    },
    [nearbyMarks]
  );

  const getDistanceToMark = useCallback(
    (markId) => {
      const mark = nearbyMarks.find((m) => m.id === markId);
      return mark ? mark.distance : null;
    },
    [nearbyMarks]
  );

  return {
    nearbyMarks,
    closestMark,
    isNearMark,
    getDistanceToMark,
    hasNearbyMarks: nearbyMarks.length > 0,
  };
};

export default useProximity;
