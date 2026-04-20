import { useMemo, useCallback } from 'react';
import { useAuth } from '../context/useAuth.jsx';
import { useRoadmap } from '../context/useRoadmap';
import { useToast } from '../context/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { m as Motion } from 'framer-motion';
import { Plus, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import RoadmapCard from '../components/RoadmapCard';
import { useRoadmaps } from '../hooks/useRoadmaps';

const Dashboard = () => {
  const { user } = useAuth();
  const { setActiveRoadmap } = useRoadmap();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { roadmaps, loading, removeRoadmap } = useRoadmaps(user);

  const sortedRoadmaps = useMemo(
    () => [...roadmaps].sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0)),
    [roadmaps]
  );

  const handleOpenRoadmap = useCallback((roadmap) => {
    setActiveRoadmap(roadmap);
    navigate(`/roadmap/${roadmap.id}`);
  }, [setActiveRoadmap, navigate]);

  const handleDelete = useCallback(async (roadmapId) => {
    const result = await removeRoadmap(roadmapId);
    if (result?.error) {
      addToast('Failed to delete roadmap', 'error');
    } else {
      addToast('Roadmap deleted');
    }
  }, [removeRoadmap, addToast]);

  return (
    <div className="layout-container">
      <Navbar />

      <main className="layout-content">
        <div className="page-header">
          <div>
            <h1 className="dashboard-title">Your Journeys</h1>
            <p className="dashboard-subtitle">Resume or create new learning paths.</p>
          </div>
          <button onClick={() => navigate('/onboarding')} className="btn-primary-icon">
            <Plus className="icon-md" />
            <span className="create-btn-text">Create New</span>
          </button>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-skeleton"></div>
            ))}
          </div>
        ) : sortedRoadmaps.length === 0 ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state-panel"
          >
            <div className="icon-box-lg">
              <Compass className="empty-icon" />
            </div>
            <h3 className="section-title">No Roadmaps Yet</h3>
            <p className="empty-text">
              Start your journey today. Our AI will architect a bespoke, time-bound learning path adapted to your goals.
            </p>
            <Link to="/onboarding" className="btn-primary-large">
              Generate Your First Roadmap
            </Link>
          </Motion.div>
        ) : (
          <div className="grid-cards">
            {sortedRoadmaps.map((roadmap, index) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                index={index}
                onClick={() => handleOpenRoadmap(roadmap)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
