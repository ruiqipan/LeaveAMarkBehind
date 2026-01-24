import { useState, useRef, useEffect } from 'react';
import './MediaUpload.css';

const MediaUpload = ({ type, onChange, onRecord, accept }) => {
  const [preview, setPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    onChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        onRecord(file);

        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreview(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-upload">
      {type === 'image' && (
        <div className="image-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="file-input"
            id="image-upload"
          />
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onChange(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="btn-remove-preview"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <label htmlFor="image-upload" className="upload-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">Click to select image</span>
              <span className="upload-hint">JPEG, PNG, GIF, WebP (max 10MB)</span>
            </label>
          )}
        </div>
      )}

      {type === 'audio' && (
        <div className="audio-upload">
          {preview ? (
            <div className="preview-container">
              <audio src={preview} controls className="audio-preview" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onRecord(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="btn-remove-preview"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <>
              <div className="recording-controls">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="btn-record"
                  >
                    <span className="record-icon">🎤</span>
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="btn-stop"
                  >
                    <span className="recording-indicator"></span>
                    Stop Recording ({formatTime(recordingTime)})
                  </button>
                )}
              </div>

              <div className="upload-divider">
                <span>or</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="file-input"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="upload-label-small">
                <span className="upload-icon">📁</span>
                Upload audio file
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
