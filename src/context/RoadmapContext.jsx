import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { updateRoadmapProgress } from '../services/roadmapService';
import { useAuth } from './AuthContext';

const RoadmapContext = createContext();

export const RoadmapProvider = ({ children }) => {
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const { user } = useAuth();

  const toggleTask = useCallback(async (taskId) => {
    if (!activeRoadmap) return;
    
    const updatedNodes = activeRoadmap.roadmap_json.map(node => 
      node.id === taskId ? { ...node, completed: !node.completed } : node
    );

    const completedCount = updatedNodes.filter(n => n.completed).length;
    const progress_percentage = Math.round((completedCount / updatedNodes.length) * 100);

    const updatedRoadmap = {
      ...activeRoadmap,
      roadmap_json: updatedNodes,
      progress_percentage
    };

    setActiveRoadmap(updatedRoadmap);

    if (user && activeRoadmap.id) {
      await updateRoadmapProgress(activeRoadmap.id, updatedNodes, progress_percentage);
    }
  }, [activeRoadmap, user]);

  const progressPercentage = useMemo(() => {
    if (!activeRoadmap || !activeRoadmap.roadmap_json) return 0;
    const completedCount = activeRoadmap.roadmap_json.filter(n => n.completed).length;
    return Math.round((completedCount / activeRoadmap.roadmap_json.length) * 100);
  }, [activeRoadmap]);

  return (
    <RoadmapContext.Provider value={{
      activeRoadmap,
      setActiveRoadmap,
      toggleTask,
      progressPercentage
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => useContext(RoadmapContext);
