import TopTextList from './TopTextList';
import TopAudioList from './TopAudioList';
import ImageGrid from './ImageGrid';
import './SnapshotView.css';

// Sample mock data for the snapshot preview
const sampleTextMarks = [
  {
    id: 'text-1',
    content: 'The sunset from this spot is absolutely breathtaking. Been coming here for years and it never gets old.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    view_count: 342,
    add_count: 28,
  },
  {
    id: 'text-2',
    content: 'Best coffee shop in the neighborhood! The barista remembers my order every time.',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    view_count: 256,
    add_count: 19,
  },
  {
    id: 'text-3',
    content: 'Found this hidden gem of a park. Perfect for a quiet afternoon read.',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    view_count: 189,
    add_count: 15,
  },
  {
    id: 'text-4',
    content: 'Street musicians playing jazz here every Friday evening. Pure magic!',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    view_count: 167,
    add_count: 12,
  },
  {
    id: 'text-5',
    content: 'The architecture of this building tells so many stories. Love walking past it.',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    view_count: 134,
    add_count: 8,
  },
];

const sampleAudioMarks = [
  {
    id: 'audio-1',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Street Performance',
    duration: '2:34',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    view_count: 198,
    add_count: 24,
  },
  {
    id: 'audio-2',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'City Ambience',
    duration: '1:45',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    view_count: 156,
    add_count: 18,
  },
  {
    id: 'audio-3',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'Local Band Live',
    duration: '3:12',
    created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    view_count: 134,
    add_count: 11,
  },
  {
    id: 'audio-4',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    title: 'Morning Birds',
    duration: '0:58',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    view_count: 112,
    add_count: 9,
  },
  {
    id: 'audio-5',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    title: 'Rain on Rooftop',
    duration: '4:20',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    view_count: 98,
    add_count: 7,
  },
];

const sampleImageMarks = [
  { id: 'img-1', content: 'https://picsum.photos/seed/mark1/400/600', view_count: 423, add_count: 34 },
  { id: 'img-2', content: 'https://picsum.photos/seed/mark2/400/400', view_count: 387, add_count: 28 },
  { id: 'img-3', content: 'https://picsum.photos/seed/mark3/400/500', view_count: 312, add_count: 25 },
  { id: 'img-4', content: 'https://picsum.photos/seed/mark4/400/350', view_count: 289, add_count: 21 },
  { id: 'img-5', content: 'https://picsum.photos/seed/mark5/400/450', view_count: 267, add_count: 19 },
  { id: 'img-6', content: 'https://picsum.photos/seed/mark6/400/550', view_count: 245, add_count: 17 },
  { id: 'img-7', content: 'https://picsum.photos/seed/mark7/400/380', view_count: 234, add_count: 15 },
  { id: 'img-8', content: 'https://picsum.photos/seed/mark8/400/420', view_count: 212, add_count: 14 },
  { id: 'img-9', content: 'https://picsum.photos/seed/mark9/400/480', view_count: 198, add_count: 12 },
  { id: 'img-10', content: 'https://picsum.photos/seed/mark10/400/520', view_count: 187, add_count: 11 },
  { id: 'img-11', content: 'https://picsum.photos/seed/mark11/400/360', view_count: 176, add_count: 10 },
  { id: 'img-12', content: 'https://picsum.photos/seed/mark12/400/440', view_count: 165, add_count: 9 },
];

const SnapshotView = ({ onMarkClick, embedded = false }) => {
  const today = new Date();
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
      {/* Header */}
      <div className="snapshot-header">
        <div className="snapshot-title">
          <span className="snapshot-icon">📸</span>
          <div>
            <h2>Daily Snapshot</h2>
            <p className="snapshot-date">{formatDate(today)}</p>
          </div>
        </div>
      </div>

      {/* Location pill */}
      <div className="snapshot-location-bar">
        <div className="location-pill">
          <span className="location-icon">📍</span>
          <span className="location-text">Downtown District</span>
        </div>
        <div className="expiry-badge">
          <span>23h remaining</span>
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
          Showcasing the most engaging content from your area
        </p>
      </div>
    </div>
  );
};

export default SnapshotView;
