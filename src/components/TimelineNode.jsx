import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * TimelineNode — reusable component representing a single step
 * in a learning roadmap's timeline.
 *
 * Wrapped in React.memo to prevent re-rendering sibling nodes
 * when a different node's task is toggled.
 *
 * @param {object}   node          - The roadmap step data (id, task, desc, resources, completed)
 * @param {number}   index         - Position in the list, used for animation delay
 * @param {boolean}  isCompleted   - Whether this step is done
 * @param {boolean}  isNext        - Whether this is the current active step
 * @param {Function} onToggle      - Callback to mark the task complete/incomplete
 * @param {object}   activeRef     - React ref attached only to the active node for auto-scroll
 */
const TimelineNode = memo(function TimelineNode({
  node,
  index,
  isCompleted,
  isNext,
  onToggle,
  activeRef,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      key={node.id || index}
      ref={isNext ? activeRef : null}
      className={`group ${isCompleted ? 'node-done' : isNext ? 'node-active' : 'timeline-node'}`}
    >
      {/* Toggle button — marks step complete or incomplete */}
      <button onClick={() => onToggle(node.id)} className="timeline-dot-btn">
        {isCompleted ? (
          <CheckCircle2 className="icon-completed" />
        ) : isNext ? (
          <Circle className="icon-current" />
        ) : (
          <Circle className="icon-pending" />
        )}
      </button>

      <div className={isNext ? 'node-card-active' : 'node-card'}>
        <div className="card-header">
          <h3 className={isCompleted ? 'card-title-completed' : 'card-title-pending'}>
            {node.task}
          </h3>
        </div>

        <p className="card-description">{node.desc}</p>

        {node.resources && node.resources.length > 0 && (
          <div className="resource-section">
            <h4 className="resource-title">Resources</h4>
            <div className="resource-list">
              {node.resources.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-badge"
                >
                  <span className="truncate">Resource {i + 1}</span>
                  <ExternalLink className="icon-xs" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

TimelineNode.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.number.isRequired,
    task: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(PropTypes.string),
    completed: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isNext: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  activeRef: PropTypes.object,
};

export default TimelineNode;
