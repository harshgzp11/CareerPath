import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * RoadmapCard — reusable card component for displaying a roadmap
 * summary in the Dashboard grid.
 *
 * Wrapped in React.memo — prevents re-render when sibling cards
 * or parent state updates unrelated to this card's data.
 *
 * @param {object}   roadmap   - The roadmap data object from Supabase
 * @param {number}   index     - Position in list, used for staggered animation
 * @param {Function} onClick   - Handler to open the roadmap detail page
 * @param {Function} onDelete  - Handler to delete this roadmap
 */
const RoadmapCard = memo(function RoadmapCard({ roadmap, index, onClick, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const progress = roadmap.progress_percentage || 0;
  const moduleCount = roadmap.roadmap_json?.length || 0;

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation(); // Prevent card click from firing
    setConfirmDelete(true);
  }, []);

  const handleCancelDelete = useCallback((e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  }, []);

  const handleConfirmDelete = useCallback(async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(roadmap.id);
    // No need to reset — card will be removed from the list
  }, [onDelete, roadmap.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: deleting ? 0 : index * 0.1 }}
      onClick={confirmDelete ? undefined : onClick}
      className={`card-interactive group ${confirmDelete ? 'border-red-500/40' : ''}`}
    >
      <div className="card-interactive-indicator"></div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="delete-overlay"
          >
            <AlertTriangle className="icon-warn" />
            <p className="delete-confirm-text">Delete this roadmap?</p>
            <p className="delete-confirm-sub">This cannot be undone.</p>
            <div className="delete-actions">
              <button
                onClick={handleCancelDelete}
                className="btn-ghost"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className="card-top-row">
        <h3 className="card-title-hoverable">{roadmap.title}</h3>
        <button
          onClick={handleDeleteClick}
          className="delete-btn"
          title="Delete roadmap"
        >
          <Trash2 className="icon-sm" />
        </button>
      </div>

      <div className="card-stats">
        <div className="card-badge">
          <CheckCircle className="icon-sm-secondary" />
          <span>{progress}% Complete</span>
        </div>
        <div className="card-badge">
          <Clock className="icon-sm" />
          <span>{moduleCount} Modules</span>
        </div>
      </div>

      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </motion.div>
  );
});

RoadmapCard.propTypes = {
  roadmap: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    progress_percentage: PropTypes.number,
    roadmap_json: PropTypes.array,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default RoadmapCard;
