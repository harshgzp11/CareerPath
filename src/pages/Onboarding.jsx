import { useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../context/ToastContext';
import { generateRoadmap } from '../services/ai';
import { createRoadmap } from '../services/roadmapService';
import { ChevronRight, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

// Child Components demonstrating "Lifting State Up"
const RoleStep = ({ role, onChange }) => (
  <>
    <label className="form-label-lg">What role are you targeting?</label>
    <input
      type="text"
      placeholder="e.g. Senior Frontend Developer"
      className="input-lg"
      value={role}
      onChange={(e) => onChange('role', e.target.value)}
      autoFocus
    />
    <p className="text-subheading-spaced">Be specific for better AI results.</p>
  </>
);

const LevelStep = ({ level, onChange }) => (
  <>
    <label className="form-label-lg">What is your current skill level?</label>
    <select
      className="select-lg"
      value={level}
      onChange={(e) => onChange('level', e.target.value)}
    >
      <option value="Complete Beginner">Complete Beginner</option>
      <option value="Beginner">Beginner (Some basics)</option>
      <option value="Intermediate">Intermediate (Can build simple apps)</option>
      <option value="Advanced">Advanced (Looking to master)</option>
    </select>
  </>
);

const TimeStep = ({ time, onChange }) => (
  <>
    <label className="form-label-lg">How many hours can you dedicate weekly?</label>
    <div className="slider-wrapper">
      <input
        type="range"
        min="2"
        max="40"
        step="2"
        className="slider-input"
        value={time}
        onChange={(e) => onChange('time', e.target.value)}
      />
      <span className="slider-value">{time}h</span>
    </div>
  </>
);

// ── useReducer: manages multi-step form state + loading + error ──
const initialState = {
  step: 1,
  role: '',
  level: 'Beginner',
  time: '10',
  loading: false,
  error: null,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 3) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) };
    case 'START_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

// Parent Component
export default function Onboarding() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { step, role, level, time, loading, error } = state;

  const { user } = useAuth();
  const { setActiveRoadmap } = useRoadmap();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // useCallback: memoize handlers so step sub-components don't re-render needlessly
  const updateFormData = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const handleNext = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const handlePrev = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);

  const handleGenerate = async () => {
    dispatch({ type: 'START_LOADING' });
    try {
      const roadmapNodes = await generateRoadmap(role, level, time);
      const roadmap_json = roadmapNodes.map(node => ({ ...node, completed: false }));

      const { data, error } = await createRoadmap({
        user_id: user.id,
        title: `${role} Roadmap`,
        roadmap_json,
        progress_percentage: 0,
      });

      if (error) throw error;

      setActiveRoadmap(data);
      addToast('Roadmap created successfully!');
      navigate(`/roadmap/${data.id}`);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'An error occurred during generation.' });
      addToast(err.message || 'Failed to generate roadmap', 'error');
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="layout-container">
      <Navbar />
      
      <main className="main-content-centered">
        {loading ? (
          <div className="loader-layout">
            <div className="spinner-container">
              <div className="spinner-bg"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-center">
                <Sparkles className="spinner-icon" />
              </div>
            </div>
            <h2 className="text-heading">Architecting Your Path</h2>
            <p className="text-muted">Our AI is analyzing {role} requirements and structuring a custom curriculum...</p>
            
            <div className="loader-stack">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shimmer-block"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="form-card">
            <div className="step-header">
              <h2 className="text-title">Create Blueprint</h2>
              <div className="step-indicator">
                Step {step} of 3
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle className="icon-error" />
                <span>{error}</span>
              </div>
            )}

            <div className="step-container">
              <AnimatePresence mode="wait" custom={1}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="step-slide"
                  >
                    <RoleStep role={role} onChange={updateFormData} />
                  </motion.div>
                )}
                
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="step-slide"
                  >
                    <LevelStep level={level} onChange={updateFormData} />
                  </motion.div>
                )}
                
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="step-slide"
                  >
                    <TimeStep time={time} onChange={updateFormData} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="form-actions">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className={`btn-secondary flex-center-y space-x-2 ${step === 1 ? 'opacity-0 cursor-default' : ''}`}
              >
                <ChevronLeft className="icon-sm" />
                <span>Back</span>
              </button>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!role && step === 1}
                  className="btn-primary-icon"
                >
                  <span>Next</span>
                  <ChevronRight className="icon-sm" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="btn-primary-glow"
                >
                  <Sparkles className="icon-sm" />
                  <span>Generate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
