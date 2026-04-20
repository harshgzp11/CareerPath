import { db, timestamp } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

/**
 * roadmapService — all direct Firestore calls related to roadmaps.
 */

export async function fetchRoadmaps(userId) {
  try {
    const roadmapsQuery = query(
      collection(db, 'roadmaps'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(roadmapsQuery);
    const data = snapshot.docs.map((roadmapDoc) => ({
      id: roadmapDoc.id,
      ...roadmapDoc.data(),
    }));

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchRoadmapById(id, userId) {
  try {
    const roadmapRef = doc(db, 'roadmaps', id);
    const roadmapSnap = await getDoc(roadmapRef);

    if (!roadmapSnap.exists()) {
      return { data: null, error: new Error('Roadmap not found') };
    }

    const data = { id: roadmapSnap.id, ...roadmapSnap.data() };
    if (data.user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateRoadmapProgress(roadmapId, roadmapJson, progressPercentage) {
  try {
    const roadmapRef = doc(db, 'roadmaps', roadmapId);
    await updateDoc(roadmapRef, {
      roadmap_json: roadmapJson,
      progress_percentage: progressPercentage,
    });
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createRoadmap(roadmap) {
  try {
    const newRoadmapRef = await addDoc(collection(db, 'roadmaps'), {
      ...roadmap,
      created_at: timestamp(),
    });

    return {
      data: {
        id: newRoadmapRef.id,
        ...roadmap,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteRoadmap(id /* userId */) {
  try {
    const roadmapRef = doc(db, 'roadmaps', id);
    await deleteDoc(roadmapRef);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function renameRoadmap(id, newTitle) {
  try {
    const roadmapRef = doc(db, 'roadmaps', id);
    await updateDoc(roadmapRef, { title: newTitle });
    return { data: { id, title: newTitle }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
