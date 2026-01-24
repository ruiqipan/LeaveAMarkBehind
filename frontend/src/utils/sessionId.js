/**
 * Generate or retrieve a persistent session ID for the current browser
 * Used for tracking mark views and preventing duplicate counting
 * @returns {string} Session ID
 */
export const getSessionId = () => {
  const STORAGE_KEY = 'leave_a_mark_session_id';

  // Try to get existing session ID from localStorage
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    // Generate new session ID using timestamp + random string
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Generate a simple browser fingerprint for additional tracking
 * Note: This is not meant to be cryptographically secure
 * @returns {string} Browser fingerprint
 */
export const getBrowserFingerprint = () => {
  const nav = navigator;
  const screen = window.screen;

  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `fp_${Math.abs(hash).toString(36)}`;
};

/**
 * Get or create a combined session identifier
 * Combines session ID with browser fingerprint for better accuracy
 * @returns {string} Combined session identifier
 */
export const getSessionIdentifier = () => {
  const sessionId = getSessionId();
  const fingerprint = getBrowserFingerprint();
  return `${sessionId}_${fingerprint}`;
};

/**
 * Clear session ID (useful for testing)
 */
export const clearSession = () => {
  localStorage.removeItem('leave_a_mark_session_id');
};
