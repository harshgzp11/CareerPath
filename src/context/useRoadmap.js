import { useContext } from 'react';
import { RoadmapContext } from './RoadmapContext.jsx';

export const useRoadmap = () => useContext(RoadmapContext);
