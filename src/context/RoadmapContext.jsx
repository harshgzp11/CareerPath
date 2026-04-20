import { createContext, useState, useMemo, useCallback } from 'react';
import { updateRoadmapProgress } from '../services/roadmapService';

/* eslint-disable-next-line react-refresh/only-export-components */
export const RoadmapContext = createContext(null);

export const RoadmapProvider = ({ children }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmapState] = useState(null);

  const addRoadmap = useCallback((newRoadmap) => {
    setRoadmaps((prev) => [newRoadmap, ...prev]);
  }, []);

  const setActiveRoadmap = useCallback((roadmap) => {
    setActiveRoadmapState(roadmap);

    if (!roadmap?.id) return;

    setRoadmaps((prev) => {
      const index = prev.findIndex((item) => item.id === roadmap.id);

      if (index === -1) {
        return [roadmap, ...prev];
      }

      const next = [...prev];
      next[index] = { ...next[index], ...roadmap };
      return next;
    });
  }, []);

  const progressPercentage = useMemo(
    () => activeRoadmap?.progress_percentage ?? 0,
    [activeRoadmap]
  );

  const toggleTask = useCallback(async (taskId) => {
    if (!activeRoadmap) return;

    const previousRoadmap = activeRoadmap;
    const currentNodes = activeRoadmap.roadmap_json || [];
    const updatedNodes = currentNodes.map((node) => (
      node.id === taskId ? { ...node, completed: !node.completed } : node
    ));

    const completedCount = updatedNodes.filter((node) => node.completed).length;
    const nextProgress = updatedNodes.length
      ? Math.round((completedCount / updatedNodes.length) * 100)
      : 0;

    const updatedRoadmap = {
      ...activeRoadmap,
      roadmap_json: updatedNodes,
      progress_percentage: nextProgress,
    };

    setActiveRoadmapState(updatedRoadmap);
    setRoadmaps((prev) => prev.map((item) => (item.id === updatedRoadmap.id ? updatedRoadmap : item)));

    const { error } = await updateRoadmapProgress(
      updatedRoadmap.id,
      updatedRoadmap.roadmap_json,
      updatedRoadmap.progress_percentage
    );

    if (error) {
      setActiveRoadmapState(previousRoadmap);
      setRoadmaps((prev) => prev.map((item) => (item.id === previousRoadmap.id ? previousRoadmap : item)));
    }
  }, [activeRoadmap]);

  const value = useMemo(() => ({
    roadmaps,
    addRoadmap,
    activeRoadmap,
    setActiveRoadmap,
    toggleTask,
    progressPercentage,
  }), [roadmaps, addRoadmap, activeRoadmap, setActiveRoadmap, toggleTask, progressPercentage]);

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};
