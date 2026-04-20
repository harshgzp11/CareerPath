import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.jsx';
import { useRoadmap } from '../context/useRoadmap';
import { useToast } from '../context/useToast';
import { fetchRoadmapById, deleteRoadmap, renameRoadmap } from '../services/roadmapService';
import { m as Motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Trash2, Pencil, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import TimelineNode from '../components/TimelineNode';

export default function RoadmapDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { activeRoadmap, setActiveRoadmap, toggleTask, progressPercentage } = useRoadmap();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!activeRoadmap);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rename state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const renameInputRef = useRef(null);

  // useRef: holds a reference to the current active node's DOM element
  // for imperatively scrolling it into view after the roadmap loads.
  const activeNodeRef = useRef(null);

  // Fetch roadmap from service layer with AbortController for cleanup
  useEffect(() => {
    const abortController = new AbortController();

    const loadRoadmap = async () => {
      if (!activeRoadmap || activeRoadmap.id !== id) {
        setLoading(true);
        const { data, error } = await fetchRoadmapById(id, user.uid);
        if (abortController.signal.aborted) return;
        if (data) setActiveRoadmap(data);
        if (error) {
          setError('Failed to load roadmap details. Please try again.');
        }
        setLoading(false);
      }
    };
    loadRoadmap();

    return () => abortController.abort();
  }, [id, activeRoadmap, setActiveRoadmap, navigate, user.uid]);

  // Scroll the active node into view once loading is done
  useEffect(() => {
    if (!loading && activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading]);

  // Focus the rename input when editing starts
  useEffect(() => {
    if (isEditing && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isEditing]);

  // useCallback: stable handler — avoids creating a new function on every render
  const handleBack = useCallback(() => navigate('/dashboard'), [navigate]);

  // Delete the active roadmap and navigate back to dashboard
  const handleDelete = useCallback(async () => {
    if (!activeRoadmap) return;
    setDeleting(true);
    const { error } = await deleteRoadmap(activeRoadmap.id, user.uid);
    if (!error) {
      setActiveRoadmap(null);
      addToast('Roadmap deleted successfully');
      navigate('/dashboard');
    } else {
      addToast('Failed to delete roadmap', 'error');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }, [activeRoadmap, user.uid, setActiveRoadmap, navigate, addToast]);

  // Start editing title
  const startRename = useCallback(() => {
    setEditTitle(activeRoadmap?.title || '');
    setIsEditing(true);
  }, [activeRoadmap]);

  // Save new title
  const saveRename = useCallback(async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === activeRoadmap.title) {
      setIsEditing(false);
      return;
    }
    const { data, error } = await renameRoadmap(activeRoadmap.id, trimmed);
    if (!error && data) {
      setActiveRoadmap(data);
      addToast('Title updated');
    } else {
      addToast('Failed to rename', 'error');
    }
    setIsEditing(false);
  }, [editTitle, activeRoadmap, setActiveRoadmap, addToast]);

  // Cancel editing
  const cancelRename = useCallback(() => setIsEditing(false), []);

  // Handle Enter / Escape keys
  const handleRenameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') cancelRename();
  }, [saveRename, cancelRename]);

  if (loading) {
    return (
      <div className="layout-container">
        <Navbar />
        <div className="flex-grow flex-center">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout-container">
        <Navbar />
        <div className="flex-grow flex-center">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const nodes = activeRoadmap.roadmap_json || [];
  const activeNodeIndex = nodes.findIndex(n => !n.completed);

  return (
    <div className="layout-padded">
      {/* Sticky Top Bar & Progress */}
      <div className="topbar-sticky">
        <div className="container-narrow">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft className="icon-sm" />
            <span>Back to Dashboard</span>
          </button>

          <div className="roadmap-header">
            {/* Inline editable title */}
            {isEditing ? (
              <div className="flex-1">
                <input
                  ref={renameInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  className="rename-input"
                />
                <div className="rename-actions">
                  <button onClick={saveRename} className="btn-ghost" title="Save">
                    <Check className="icon-sm text-green-400" />
                  </button>
                  <button onClick={cancelRename} className="btn-ghost" title="Cancel">
                    <X className="icon-sm text-gray-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-center-y space-x-3">
                <h1 className="roadmap-title">{activeRoadmap.title}</h1>
                <button onClick={startRename} className="btn-ghost" title="Rename">
                  <Pencil className="icon-xs" />
                </button>
              </div>
            )}

            <div className="topbar-actions">
              <div className="roadmap-progress-text">{progressPercentage}%</div>
              {deleteConfirm ? (
                <div className="inline-delete-confirm">
                  <span className="delete-confirm-label">Sure?</span>
                  <button onClick={() => setDeleteConfirm(false)} className="btn-ghost" disabled={deleting}>Cancel</button>
                  <button onClick={handleDelete} className="btn-danger" disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="delete-btn"
                  title="Delete this roadmap"
                >
                  <Trash2 className="icon-sm" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Timeline — each step is a memoized TimelineNode component */}
      <main className="roadmap-content">
        <div className="timeline-container">
          {nodes.map((node, index) => (
            <TimelineNode
              key={node.id || index}
              node={node}
              index={index}
              isCompleted={node.completed}
              isNext={index === activeNodeIndex}
              onToggle={toggleTask}
              activeRef={activeNodeRef}
            />
          ))}
        </div>

        {progressPercentage === 100 && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="milestone-card"
          >
            <div className="icon-box-secondary">
              <CheckCircle2 className="icon-secondary-lg" />
            </div>
            <h2 className="text-heading">Journey Complete!</h2>
            <p className="text-muted-spaced">
              You've mastered all the steps in this roadmap. Time to apply your new skills.
            </p>
            <button onClick={() => navigate('/onboarding')} className="btn-primary">
              Start a New Journey
            </button>
          </Motion.div>
        )}
      </main>
    </div>
  );
}
