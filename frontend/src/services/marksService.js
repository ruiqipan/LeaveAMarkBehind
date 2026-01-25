import { supabase } from './supabaseClient';
import { getSessionId } from '../utils/sessionId';

/**
 * Fetch active marks within a geographic bounding box
 * @param {number} north - North latitude bound
 * @param {number} south - South latitude bound
 * @param {number} east - East longitude bound
 * @param {number} west - West longitude bound
 * @returns {Promise<Array>} Array of marks
 */
export const getMarksInBounds = async (north, south, east, west) => {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty marks');
    return [];
  }

  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .eq('is_active', true)
    .gte('latitude', south)
    .lte('latitude', north)
    .gte('longitude', west)
    .lte('longitude', east)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marks:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch active marks at a specific location (within small radius)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - Search radius in meters (default 100m)
 * @returns {Promise<Array>} Array of marks
 */
export const getMarksAtLocation = async (lat, lng, radiusMeters = 100) => {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty marks');
    return [];
  }

  // Calculate approximate degree delta for the radius
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .eq('is_active', true)
    .gte('latitude', lat - latDelta)
    .lte('latitude', lat + latDelta)
    .gte('longitude', lng - lngDelta)
    .lte('longitude', lng + lngDelta)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marks at location:', error);
    throw error;
  }

  return data || [];
};

/**
 * Create a new mark
 * @param {object} markData - Mark data
 * @param {string} markData.type - 'text', 'image', 'audio', or 'canvas'
 * @param {string} markData.content - Content or URL
 * @param {number} markData.latitude - Latitude
 * @param {number} markData.longitude - Longitude
 * @param {string} markData.parent_id - Optional parent mark ID for threading
 * @param {string} markData.image_url - Optional image URL (for canvas thumbnails)
 * @returns {Promise<object>} Created mark
 */
export const createMark = async ({ type, content, latitude, longitude, parent_id = null, image_url = null }) => {
  const insertData = {
    type,
    content,
    latitude,
    longitude,
    parent_id,
  };

  // Add image_url if provided (used for canvas thumbnails)
  if (image_url) {
    insertData.image_url = image_url;
  }

  const { data, error } = await supabase
    .from('marks')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating mark:', error);
    throw error;
  }

  // If this is a reply, increment the parent's add_count
  if (parent_id) {
    await incrementAddCount(parent_id);
  }

  return data;
};

/**
 * Record a mark view
 * @param {string} markId - Mark ID
 * @returns {Promise<void>}
 */
export const recordMarkView = async (markId) => {
  const sessionId = getSessionId();

  // Check if already viewed in this session (last 24 hours)
  const { data: existingView } = await supabase
    .from('mark_views')
    .select('id')
    .eq('mark_id', markId)
    .eq('session_id', sessionId)
    .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  // Only record if not already viewed
  if (!existingView) {
    const { error: viewError } = await supabase
      .from('mark_views')
      .insert([{ mark_id: markId, session_id: sessionId }]);

    if (viewError) {
      console.error('Error recording view:', viewError);
    }

    // Increment view count on the mark
    await incrementViewCount(markId);
  }
};

/**
 * Increment view count for a mark
 * @param {string} markId - Mark ID
 * @returns {Promise<void>}
 */
export const incrementViewCount = async (markId) => {
  const { error } = await supabase.rpc('increment_view_count', {
    mark_id: markId,
  });

  if (error) {
    // Fallback to update if RPC doesn't exist
    const { error: updateError } = await supabase
      .from('marks')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('id', markId);

    if (updateError) {
      console.error('Error incrementing view count:', updateError);
    }
  }
};

/**
 * Increment add count for a mark (when someone replies to it)
 * @param {string} markId - Mark ID
 * @returns {Promise<void>}
 */
export const incrementAddCount = async (markId) => {
  const { error } = await supabase.rpc('increment_add_count', {
    mark_id: markId,
  });

  if (error) {
    // Fallback to update if RPC doesn't exist
    const { error: updateError } = await supabase
      .from('marks')
      .update({ add_count: supabase.raw('add_count + 1') })
      .eq('id', markId);

    if (updateError) {
      console.error('Error incrementing add count:', updateError);
    }
  }
};

/**
 * Get thread (parent + all children) for a mark
 * @param {string} markId - Parent mark ID
 * @returns {Promise<Array>} Array of marks in thread
 */
export const getMarkThread = async (markId) => {
  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .or(`id.eq.${markId},parent_id.eq.${markId}`)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching thread:', error);
    throw error;
  }

  return data || [];
};

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('mark-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('mark-images').getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Upload audio to Supabase Storage
 * @param {File} file - Audio file
 * @returns {Promise<string>} Public URL of uploaded audio
 */
export const uploadAudio = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('mark-audio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading audio:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('mark-audio').getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Upload canvas PNG thumbnail to Supabase Storage
 * @param {string} dataUrl - Base64 data URL of the canvas PNG
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadCanvasImage = async (dataUrl) => {
  // Convert data URL to Blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  const fileName = `canvas-${Date.now()}-${Math.random().toString(36).substring(2)}.png`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('mark-images')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png',
    });

  if (uploadError) {
    console.error('Error uploading canvas image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('mark-images').getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Get snapshot for a location
 * @param {string} locationClusterId - Location cluster ID
 * @returns {Promise<object|null>} Snapshot data or null
 */
export const getSnapshotForLocation = async (locationClusterId) => {
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('location_cluster_id', locationClusterId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching snapshot:', error);
    throw error;
  }

  return data;
};

/**
 * Get marks by IDs (for snapshot display)
 * @param {Array<string>} markIds - Array of mark IDs
 * @returns {Promise<Array>} Array of marks
 */
export const getMarksByIds = async (markIds) => {
  if (!markIds || markIds.length === 0) return [];

  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .in('id', markIds);

  if (error) {
    console.error('Error fetching marks by IDs:', error);
    throw error;
  }

  return data || [];
};

/**
 * Update canvas content for a mark
 * @param {string} markId - Mark ID
 * @param {string} canvasData - Serialized canvas JSON
 * @param {string} imageUrl - Optional new image URL for thumbnail
 * @returns {Promise<object>} Updated mark
 */
export const updateCanvasContent = async (markId, canvasData, imageUrl = null) => {
  const updateData = { content: canvasData };

  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { data, error } = await supabase
    .from('marks')
    .update(updateData)
    .eq('id', markId)
    .eq('type', 'canvas')
    .select()
    .single();

  if (error) {
    console.error('Error updating canvas:', error);
    throw error;
  }

  return data;
};
