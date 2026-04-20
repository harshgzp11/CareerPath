import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { deleteRoadmap } from '../services/roadmapService';

/**
 * Custom hook — encapsulates all roadmap list fetching and deletion logic.
 * Demonstrates: custom hook pattern, useState, useEffect, useCallback.
 *
 * @param {object} user - The authenticated Supabase user object.
 * @returns {{ roadmaps, loading, refetch, removeRoadmap }}
 */
export function useRoadmaps(user) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmaps = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setRoadmaps(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  /**
   * Optimistically removes the roadmap from local state, then persists
   * the deletion to the database. Rolls back on error.
   */
  const removeRoadmap = useCallback(async (roadmapId) => {
    // Optimistic update: remove from UI immediately
    const previous = roadmaps;
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));

    const { error } = await deleteRoadmap(roadmapId, user.id);
    if (error) {
      // Roll back if the server call failed
      setRoadmaps(previous);
      return { error };
    }
    return { error: null };
  }, [roadmaps, user]);

  return { roadmaps, loading, refetch: fetchRoadmaps, removeRoadmap };
}
