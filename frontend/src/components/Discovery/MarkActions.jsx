import './MarkActions.css';

const MarkActions = ({ onAddTo, onViewAnother, onClose }) => {
  return (
    <div className="mark-actions">
      <button onClick={onAddTo} className="btn-action btn-add-to">
        <span className="btn-icon">➕</span>
        Add To
      </button>

      {onViewAnother && (
        <button onClick={onViewAnother} className="btn-action btn-view-another">
          <span className="btn-icon">🔄</span>
          View Another
        </button>
      )}
    </div>
  );
};

export default MarkActions;
