import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnapshotPage from './pages/SnapshotPage';
import BottomNav from './components/Navigation/BottomNav';
import Onboarding, { hasCompletedOnboarding } from './components/Onboarding/Onboarding';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = hasCompletedOnboarding();
    setShowOnboarding(!completed);
    setIsReady(true);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Don't render anything until we've checked onboarding status
  if (!isReady) {
    return null;
  }

  return (
    <Router>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/snapshot" element={<SnapshotPage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
