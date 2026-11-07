import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, PlusSquare, Users, Moon, Sun, LogOut } from 'lucide-react';
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
    <nav className="bottom-nav">
      <button className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
        <Home size={20} />
        <span>Accueil</span>
      </button>

      {(user?.role === 'admin' || user?.role === 'secretaire') && (
        <button className={`nav-item ${location.pathname === '/devis/nouveau' ? 'active' : ''}`} onClick={() => navigate('/devis/nouveau')}>
          <PlusSquare size={20} />
          <span>Nouveau</span>
        </button>
      )}

      {user?.role === 'admin' && (
        <button className={`nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`} onClick={() => navigate('/admin/users')}>
          <Users size={20} />
          <span>Comptes</span>
        </button>
      )}

      <button className="nav-item" onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        <span>Thème</span>
      </button>

      <button className="nav-item text-red" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Sortir</span>
      </button>
    </nav>
  );
};

export default BottomNav;