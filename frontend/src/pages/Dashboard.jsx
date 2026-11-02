import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary-blue)' }}>Tableau de Bord</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenue, {user?.name} ({user?.role})</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleTheme} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--secondary-red)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main>
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-main)' }}>C'est ici que la liste des devis apparaîtra !</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>La connexion fonctionne et le thème est opérationnel.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;