/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in meters
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Proximity radius in meters for discovering marks
 */
export const PROXIMITY_RADIUS = 75; // meters

/**
 * Check if user is within proximity of a mark
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} markLat - Mark's latitude
 * @param {number} markLng - Mark's longitude
 * @returns {boolean} True if within proximity radius
 */
export const isWithinProximity = (userLat, userLng, markLat, markLng) => {
  const distance = haversineDistance(userLat, userLng, markLat, markLng);
  return distance <= PROXIMITY_RADIUS;
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Round coordinates to create location cluster ID
 * Rounding to 0.001 degrees ≈ 111 meters at equator
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Location cluster ID (e.g., "37.775_-122.419")
 */
export const getLocationClusterId = (lat, lng) => {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  return `${roundedLat}_${roundedLng}`;
};

/**
 * Calculate bounding box for map viewport queries
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @returns {object} Bounding box {north, south, east, west}
 */
export const getBoundingBox = (centerLat, centerLng, radiusMeters) => {
  // Rough conversion: 1 degree latitude ≈ 111km
  const latDelta = (radiusMeters / 111000);
  // Longitude delta depends on latitude
  const lngDelta = (radiusMeters / (111000 * Math.cos((centerLat * Math.PI) / 180)));

  return {
    north: centerLat + latDelta,
    south: centerLat - latDelta,
    east: centerLng + lngDelta,
    west: centerLng - lngDelta,
  };
};

/**
 * Check if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const areValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};
