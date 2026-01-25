import { useState, useEffect } from 'react';
import TopTextList from './TopTextList';
import TopAudioList from './TopAudioList';
import ImageGrid from './ImageGrid';
import './SnapshotView.css';

// Philadelphia-themed sample data
const sampleTextMarks = [
  {
    id: 'text-1',
    content: 'Pro tip: The best cheesesteak isn\'t at Pat\'s or Geno\'s. Find a random corner spot and thank me later. 🥪',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    view_count: 342,
    add_count: 28,
  },
  {
    id: 'text-2',
    content: '"In Philadelphia, a surprising number of strangers will strike up a conversation about absolutely nothing." — true story happening right now',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    view_count: 256,
    add_count: 19,
  },
  {
    id: 'text-3',
    content: 'Roses are red, violets are blue, I ran up the Art Museum steps, now my legs get red too 🏃‍♂️',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    view_count: 189,
    add_count: 15,
  },
  {
    id: 'text-4',
    content: 'Life hack: SEPTA key works as a great ice scraper in emergencies. Don\'t ask how I know this.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    view_count: 167,
    add_count: 12,
  },
  {
    id: 'text-5',
    content: 'Ben Franklin walked these streets. Now I\'m walking them eating a soft pretzel at 2am. We are not the same. 🥨',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    view_count: 134,
    add_count: 8,
  },
];

const sampleAudioMarks = [
  {
    id: 'audio-1',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'City Hall Plaza',
    location: 'Center City',
    duration: '2:34',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    view_count: 198,
    add_count: 24,
  },
  {
    id: 'audio-2',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'UPenn Locust Walk',
    location: 'University City',
    duration: '1:45',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    view_count: 156,
    add_count: 18,
  },
  {
    id: 'audio-3',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'Reading Terminal Market',
    location: 'Market East',
    duration: '3:12',
    created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    view_count: 134,
    add_count: 11,
  },
  {
    id: 'audio-4',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    title: 'Rittenhouse Square',
    location: 'Rittenhouse',
    duration: '0:58',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    view_count: 112,
    add_count: 9,
  },
  {
    id: 'audio-5',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    title: 'South Street Buskers',
    location: 'South Philly',
    duration: '4:20',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    view_count: 98,
    add_count: 7,
  },
];

// Philadelphia landmark images from Unsplash
const sampleImageMarks = [
  { id: 'img-1', content: 'https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=400&h=600&fit=crop', view_count: 423, add_count: 34 }, // Philadelphia skyline
  { id: 'img-2', content: 'https://images.unsplash.com/photo-1601332069884-cce9e64ea1f6?w=400&h=400&fit=crop', view_count: 387, add_count: 28 }, // City Hall
  { id: 'img-3', content: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=500&fit=crop', view_count: 312, add_count: 25 }, // Food
  { id: 'img-4', content: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=350&fit=crop', view_count: 289, add_count: 21 }, // Street art
  { id: 'img-5', content: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=450&fit=crop', view_count: 267, add_count: 19 }, // Architecture
  { id: 'img-6', content: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=550&fit=crop', view_count: 245, add_count: 17 }, // City street
  { id: 'img-7', content: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=380&fit=crop', view_count: 234, add_count: 15 }, // Urban
  { id: 'img-8', content: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400&h=420&fit=crop', view_count: 212, add_count: 14 }, // Night city
  { id: 'img-9', content: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=480&fit=crop', view_count: 198, add_count: 12 }, // Skyline
  { id: 'img-10', content: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=520&fit=crop', view_count: 187, add_count: 11 }, // Park
  { id: 'img-11', content: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=360&fit=crop', view_count: 176, add_count: 10 }, // Street
  { id: 'img-12', content: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=440&fit=crop', view_count: 165, add_count: 9 }, // Downtown
];

const SnapshotView = ({ onMarkClick, embedded = false }) => {
  const today = new Date();
  
  // Calculate time remaining until snapshot expires (36 hours after midnight generation)
  const calculateTimeRemaining = () => {
    const now = new Date();
    
    // Snapshot was generated at midnight (00:00) today
    const snapshotGenerated = new Date();
    snapshotGenerated.setHours(0, 0, 0, 0);
    
    // Snapshot expires 36 hours after generation
    const snapshotExpires = new Date(snapshotGenerated.getTime() + 36 * 60 * 60 * 1000);
    
    const diffMs = snapshotExpires - now;
    
    // If expired, show 0
    if (diffMs <= 0) {
      return 'Expired';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m remaining`;
    }
    return `${diffMins}m remaining`;
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  // Update time remaining every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`snapshot-container ${embedded ? 'embedded' : ''}`}>
      {/* Background Image */}
      <div className="snapshot-background">
        <img 
          src="https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1200&h=800&fit=crop" 
          alt="Philadelphia Skyline"
        />
      </div>

      {/* Header */}
      <div className="snapshot-header-bar">
        <div className="header-content">
          <span className="header-icon">📸</span>
          <div>
            <h2 className="header-title">Daily Snapshot</h2>
            <p className="header-date">{formatDate(today)}</p>
          </div>
        </div>
      </div>

      {/* Location pill */}
      <div className="snapshot-location-bar">
        <div className="location-pill">
          <span className="location-icon">📍</span>
          <span className="location-text">Philadelphia, PA</span>
        </div>
        <div className="expiry-badge">
          <span>{timeRemaining}</span>
        </div>
      </div>

      {/* Content sections */}
      <div className="snapshot-content">
        {/* Top Text Marks */}
        <section className="snapshot-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Top Text Marks
            </h3>
            <span className="section-badge">Top 5</span>
          </div>
          <TopTextList marks={sampleTextMarks} onMarkClick={onMarkClick} />
        </section>

        {/* Top Audio Marks */}
        <section className="snapshot-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">🎵</span>
              Top Audio Marks
            </h3>
            <span className="section-badge">Top 5</span>
          </div>
          <TopAudioList marks={sampleAudioMarks} onMarkClick={onMarkClick} />
        </section>

        {/* Image Grid */}
        <section className="snapshot-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">🖼️</span>
              Image Marks
            </h3>
            <span className="section-badge">{sampleImageMarks.length} photos</span>
          </div>
          <ImageGrid marks={sampleImageMarks} onMarkClick={onMarkClick} />
        </section>
      </div>

      {/* Footer */}
      <div className="snapshot-footer">
        <p>
          Showcasing the best of Philly today ❤️🔔
        </p>
      </div>
    </div>
  );
};

export default SnapshotView;
