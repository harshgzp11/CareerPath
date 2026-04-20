import { memo } from 'react';
import { useAuth } from '../context/useAuth';
import { Target, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * React.memo — Navbar only depends on `user` from AuthContext.
 * It should never re-render when roadmap state changes, so wrapping
 * in memo prevents unnecessary re-renders across the app.
 */
const Navbar = memo(function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container-wide">
        <div className="navbar-inner">
          <Link to="/dashboard" className="logo-btn">
            <div className="logo-box">
              <Target className="logo-icon" />
            </div>
            <span className="logo-text">CareerPath</span>
          </Link>

          <div className="navbar-links">
            <Link to="/onboarding" className="navbar-add-btn">
              <Plus className="icon-sm" />
              <span>New Roadmap</span>
            </Link>
            <div className="navbar-divider"></div>
            <span className="navbar-email">{user.email}</span>
            <button
              onClick={handleLogout}
              className="navbar-logout"
              title="Logout"
            >
              <LogOut className="icon-md" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
