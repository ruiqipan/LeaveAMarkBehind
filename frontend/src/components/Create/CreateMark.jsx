import { useState } from 'react';
import { createMark, uploadImage, uploadAudio, uploadCanvasImage } from '../../services/marksService';
import MediaUpload from './MediaUpload';
import CanvasEditor from './CanvasEditor';
import './CreateMark.css';

const CreateMark = ({ location, parentMark = null, onClose, onSuccess }) => {
  const [markType, setMarkType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [canvasData, setCanvasData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const MAX_TEXT_LENGTH = 280;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let content = '';
      let imageUrl = null;

      switch (markType) {
        case 'text':
          if (!textContent.trim()) {
            setError('Please enter some text');
            setLoading(false);
            return;
          }
          content = textContent.trim();
          break;

        case 'image':
          if (!mediaFile) {
            setError('Please select an image');
            setLoading(false);
            return;
          }
          // Upload image and get URL
          content = await uploadImage(mediaFile);
          break;

        case 'audio':
          if (!audioBlob && !mediaFile) {
            setError('Please record or upload audio');
            setLoading(false);
            return;
          }
          // Upload audio and get URL
          const audioFile = audioBlob || mediaFile;
          content = await uploadAudio(audioFile);
          break;

        case 'canvas':
          if (!canvasData || !canvasData.json) {
            setError('Please draw something on the canvas');
            setLoading(false);
            return;
          }
          // Store JSON for editing capability
          content = canvasData.json;
          // Upload PNG thumbnail to storage
          if (canvasData.png) {
            imageUrl = await uploadCanvasImage(canvasData.png);
          }
          break;

        default:
          setError('Invalid mark type');
          setLoading(false);
          return;
      }

      // Create the mark
      const newMark = await createMark({
        type: markType,
        content,
        latitude: location.latitude,
        longitude: location.longitude,
        parent_id: parentMark?.id || null,
        image_url: imageUrl,
      });

      setLoading(false);
      onSuccess?.(newMark);
      onClose();
    } catch (err) {
      console.error('Error creating mark:', err);
      setError(err.message || 'Failed to create mark');
      setLoading(false);
    }
  };

  const handleMediaChange = (file) => {
    setMediaFile(file);
  };

  const handleAudioRecord = (blob) => {
    setAudioBlob(blob);
  };

  const isFormValid = () => {
    switch (markType) {
      case 'text':
        return textContent.trim().length > 0;
      case 'image':
        return mediaFile !== null;
      case 'audio':
        return audioBlob !== null || mediaFile !== null;
      case 'canvas':
        return canvasData !== null && canvasData.json !== null;
      default:
        return false;
    }
  };

  const handleCanvasChange = (data) => {
    setCanvasData(data);
  };

  return (
    <div className="create-mark-overlay" onClick={onClose}>
      <div className="create-mark-card" onClick={(e) => e.stopPropagation()}>
        <div className="create-header">
          <h2>{parentMark ? 'Add to Mark' : 'Create New Mark'}</h2>
          <button onClick={onClose} className="btn-close-icon">
            ✕
          </button>
        </div>

        {parentMark && (
          <div className="parent-mark-preview">
            <span className="preview-label">Replying to:</span>
            <span className={`mark-type-badge ${parentMark.type}`}>
              {parentMark.type}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          {/* Type selector */}
          <div className="type-selector">
            <button
              type="button"
              className={`type-btn ${markType === 'text' ? 'active' : ''}`}
              onClick={() => setMarkType('text')}
            >
              <span className="type-icon">📝</span>
              Text
            </button>
            <button
              type="button"
              className={`type-btn ${markType === 'image' ? 'active' : ''}`}
              onClick={() => setMarkType('image')}
            >
              <span className="type-icon">🖼️</span>
              Image
            </button>
            <button
              type="button"
              className={`type-btn ${markType === 'audio' ? 'active' : ''}`}
              onClick={() => setMarkType('audio')}
            >
              <span className="type-icon">🎵</span>
              Audio
            </button>
            <button
              type="button"
              className={`type-btn ${markType === 'canvas' ? 'active' : ''}`}
              onClick={() => setMarkType('canvas')}
            >
              <span className="type-icon">🎨</span>
              Canvas
            </button>
          </div>

          {/* Content input based on type */}
          <div className="content-input">
            {markType === 'text' && (
              <div className="text-input-container">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="What would you like to leave here?"
                  maxLength={MAX_TEXT_LENGTH}
                  rows={6}
                  className="text-input"
                  autoFocus
                />
                <div className="char-counter">
                  {textContent.length} / {MAX_TEXT_LENGTH}
                </div>
              </div>
            )}

            {markType === 'image' && (
              <MediaUpload
                type="image"
                onChange={handleMediaChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
              />
            )}

            {markType === 'audio' && (
              <MediaUpload
                type="audio"
                onChange={handleMediaChange}
                onRecord={handleAudioRecord}
                accept="audio/mpeg,audio/wav,audio/ogg"
              />
            )}

            {markType === 'canvas' && (
              <CanvasEditor onChange={handleCanvasChange} />
            )}
          </div>

          {/* Error message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {markType === 'text' || markType === 'canvas' ? 'Creating...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <span className="btn-icon">✓</span>
                  {parentMark ? 'Add Reply' : 'Create Mark'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info message */}
        <div className="create-info">
          <p>
            📍 This mark will be visible to anyone within {parentMark ? 'this' : 'your current'} location
          </p>
          <p>⏱️ It will expire after 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default CreateMark;
