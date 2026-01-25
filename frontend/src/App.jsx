import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnapshotPage from './pages/SnapshotPage';
import BottomNav from './components/Navigation/BottomNav';
import './App.css';

function App() {
  useEffect(() => {
    console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("ANON KEY EXISTS:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log("MAPS KEY EXISTS:", !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log("MAPS KEY PREFIX:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.slice(0, 6));
  }, []);

  return (
    <Router>
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
