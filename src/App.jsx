import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoadmapProvider } from './context/RoadmapContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const RoadmapDetail = lazy(() => import('./pages/RoadmapDetail'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoadmapProvider>
          <ToastProvider>
            <Suspense fallback={<div className="screen-center"><div className="loader-spinner"></div></div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                
                <Route path="/roadmap/:id" element={
                  <ProtectedRoute>
                    <RoadmapDetail />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </ToastProvider>
        </RoadmapProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
