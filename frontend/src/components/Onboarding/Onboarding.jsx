import { useState, useEffect } from 'react';
import './Onboarding.css';

const ONBOARDING_KEY = 'leave-a-mark-onboarding-completed';

const slides = [
  {
    icon: '📍',
    title: 'Leave Your Mark',
    description: 'Drop messages, photos, audio, or drawings at your exact location for others to discover.',
    illustration: 'drop',
  },
  {
    icon: '🔍',
    title: 'Discover Nearby',
    description: 'Find marks left by others within walking distance. Get closer to unlock and view them.',
    illustration: 'discover',
  },
  {
    icon: '⏱️',
    title: 'Ephemeral by Design',
    description: 'All marks vanish after 24 hours. Live in the moment—nothing lasts forever.',
    illustration: 'ephemeral',
  },
];

const Onboarding = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsExiting(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setTimeout(() => {
      onComplete?.();
    }, 400);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <div className={`onboarding-overlay ${isExiting ? 'exiting' : ''}`}>
      {/* Glass card container */}
      <div className="onboarding-card">
        <div className="onboarding-container">
          {/* Top navigation bar */}
          <div className="onboarding-top-bar">
            {/* Back button */}
            {!isFirstSlide ? (
              <button className="onboarding-back" onClick={handleBack}>
                <span className="back-icon">←</span>
                Back
              </button>
            ) : (
              <div className="onboarding-back-placeholder"></div>
            )}

            {/* Skip button */}
            {!isLastSlide && (
              <button className="onboarding-skip" onClick={handleSkip}>
                Skip
              </button>
            )}
          </div>

          {/* Slide content */}
          <div className="onboarding-content" key={currentSlide}>
            {/* Animated illustration */}
            <div className={`onboarding-illustration ${slide.illustration}`}>
              <div className="illustration-icon">{slide.icon}</div>
              <div className="illustration-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
            </div>

            <h1 className="onboarding-title">{slide.title}</h1>
            <p className="onboarding-description">{slide.description}</p>
          </div>

          {/* Navigation */}
          <div className="onboarding-navigation">
            {/* Dots */}
            <div className="onboarding-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`onboarding-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Action button */}
            <button className="onboarding-action" onClick={handleNext}>
              {isLastSlide ? (
                <>
                  <span>Get Started</span>
                  <span className="action-icon">→</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <span className="action-icon">→</span>
                </>
              )}
            </button>
          </div>

          {/* Location permission hint on last slide */}
          {isLastSlide && (
            <p className="onboarding-hint">
              📱 We'll ask for location permission to show marks near you
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to check if onboarding has been completed
export const hasCompletedOnboarding = () => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

// Helper to reset onboarding (for testing)
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
};

export default Onboarding;
