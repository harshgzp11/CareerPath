import { useReducer, useRef, useEffect } from 'react';
import { useAuth } from '../context/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { m as Motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function Auth() {
  const initialState = {
    isLogin: true,
    email: '',
    password: '',
    error: null,
    loading: false,
  };

  function reducer(state, action) {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'TOGGLE_MODE':
        return { ...state, isLogin: !state.isLogin };
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLogin, email, password, error, loading } = state;
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
      } else {
        const { error } = await signup(email, password);
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleMode = () => dispatch({ type: 'TOGGLE_MODE' });
  const setField = (field, value) => dispatch({ type: 'SET_FIELD', field, value });

  return (
    <div className="layout-centered">
      {/* Background decoration */}
      <div className="bg-decoration-layer">
        <div className="bg-glow-primary" />
        <div className="bg-glow-secondary" />
      </div>

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <div className="auth-header">
          <div className="icon-box">
            <Target className="icon-primary" />
          </div>
          <h1 className="text-heading">CareerPath</h1>
          <p className="text-subheading">
            {isLogin ? 'Welcome back! Ready to resume your journey?' : 'Create your account to start building your career path.'}
          </p>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="form-label" htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              ref={emailRef}
              required
              value={email}
              onChange={(e) => setField('email', e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setField('password', e.target.value)}
              className="input-field"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            aria-label={isLogin ? 'Log in' : 'Create account'}
          >
            {loading ? (
              <span className="flex-center space-x-2">
                <span className="loader-spinner-sm" />
                <span>Processing...</span>
              </span>
            ) : (
              isLogin ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={toggleMode}
            className="text-link"
            aria-label="Toggle login/signup mode"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </Motion.div>
    </div>
  );
}
