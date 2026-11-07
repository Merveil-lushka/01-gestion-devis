import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './BottomNav.css';

const BottomNav = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Accueil</span>
      </button>

      {(user?.role === 'admin' || user?.role === 'secretaire') && (
        <button 
          className={`nav-item ${location.pathname === '/devis/nouveau' ? 'active' : ''}`}
          onClick={() => navigate('/devis/nouveau')}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-label">Nouveau</span>
        </button>
      )}

      {user?.role === 'admin' && (
        <button 
          className={`nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
          onClick={() => navigate('/admin/users')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Comptes</span>
        </button>
      )}

      <button className="nav-item" onClick={toggleTheme}>
        <span className="nav-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
        <span className="nav-label">Thème</span>
      </button>

      <button className="nav-item text-red" onClick={handleLogout}>
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Sortir</span>
      </button>
    </div>
  );
};

export default BottomNav;