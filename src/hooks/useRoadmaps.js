import { useState, useEffect, useCallback } from 'react';
import { fetchRoadmaps as fetchRoadmapsFromDb, deleteRoadmap } from '../services/roadmapService';

/**
 * Custom hook — encapsulates all roadmap list fetching and deletion logic.
 * Demonstrates: custom hook pattern, useState, useEffect, useCallback.
 *
 * @param {object} user - The authenticated Firebase user object.
 * @returns {{ roadmaps, loading, refetch, removeRoadmap }}
 */
export function useRoadmaps(user) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRoadmaps = useCallback(async () => {
    if (!user?.uid) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await fetchRoadmapsFromDb(user.uid);

    if (!error && data) setRoadmaps(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadRoadmaps();
  }, [loadRoadmaps]);

  /**
   * Optimistically removes the roadmap from local state, then persists
   * the deletion to the database. Rolls back on error.
   */
  const removeRoadmap = useCallback(async (roadmapId) => {
    const previous = roadmaps;
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));

    const { error } = await deleteRoadmap(roadmapId, user.uid);
    if (error) {
      setRoadmaps(previous);
      return { error };
    }
    return { error: null };
  }, [roadmaps, user]);

  return { roadmaps, loading, refetch: loadRoadmaps, removeRoadmap };
}
