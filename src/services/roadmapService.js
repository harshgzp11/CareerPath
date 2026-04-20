import { supabase } from './supabase';

/**
 * roadmapService — all direct Supabase calls related to roadmaps
 * are encapsulated here, keeping pages free of DB concerns.
 */

/**
 * Fetch a single roadmap by id, scoped to the authenticated user.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<{data, error}>}
 */
export async function fetchRoadmapById(id, userId) {
  return supabase
    .from('roadmaps')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
}

/**
 * Persist task completion state and progress for a roadmap.
 * @param {string} roadmapId
 * @param {Array}  roadmapJson
 * @param {number} progressPercentage
 * @returns {Promise<{data, error}>}
 */
export async function updateRoadmapProgress(roadmapId, roadmapJson, progressPercentage) {
  return supabase
    .from('roadmaps')
    .update({ roadmap_json: roadmapJson, progress_percentage: progressPercentage })
    .eq('id', roadmapId);
}

/**
 * Insert a brand-new roadmap record.
 * @param {object} roadmap - { user_id, title, roadmap_json, progress_percentage }
 * @returns {Promise<{data, error}>}
 */
export async function createRoadmap(roadmap) {
  return supabase.from('roadmaps').insert([roadmap]).select().single();
}

/**
 * Permanently delete a roadmap by id, scoped to the authenticated user.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<{error}>}
 */
export async function deleteRoadmap(id, userId) {
  return supabase
    .from('roadmaps')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
}

/**
 * Rename a roadmap's title.
 * @param {string} id
 * @param {string} newTitle
 * @returns {Promise<{data, error}>}
 */
export async function renameRoadmap(id, newTitle) {
  return supabase
    .from('roadmaps')
    .update({ title: newTitle })
    .eq('id', id)
    .select()
    .single();
}
