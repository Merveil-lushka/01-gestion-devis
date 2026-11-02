import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupération des devis au chargement de la page
  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/devis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevisList(res.data);
      } catch (err) {
        setError('Erreur lors du chargement des devis');
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* BARRE DE NAVIGATION */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Gestion Devis</h1>
          <span className="user-badge">{user?.name} ({user?.role})</span>
        </div>
        <div className="header-right">
          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="dashboard-main">
        <div className="main-header">
          <h2>Liste des devis</h2>
          <button className="btn-primary">+ Nouveau devis</button>
        </div>

        {loading && <p>Chargement des devis...</p>}
        {error && <p className="error-text">{error}</p>}

        {/* GRILLE DE CARTES DEVIS */}
        <div className="devis-grid">
          {devisList.length === 0 && !loading && (
            <p>Aucun devis trouvé pour le moment.</p>
          )}

          {devisList.map((devis) => (
            <div key={devis._id} className="devis-card">
              {/* Image de profil */}
              <div className="card-image">
                <img 
                  src={`http://localhost:3000/${devis.photoProfil}`} 
                  alt="Profil" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Photo'; }}
                />
              </div>

              {/* Infos principales */}
              <div className="card-content">
                <div className="card-header">
                  <h3>{devis.numeroDevis}</h3>
                  <span className={`badge ${devis.statut === 'termine' ? 'badge-green' : 'badge-orange'}`}>
                    {devis.statut === 'termine' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
                
                <p className="client-name">{devis.nomClient}</p>
                <p className="chantier-name">{devis.nomChantier}</p>
                
                <div className="card-footer">
                  <span className="date">{new Date(devis.dateDevis).toLocaleDateString()}</span>
                  <span className={`publish-status ${devis.isPublished ? 'published' : 'unpublished'}`}>
                    {devis.isPublished ? '🌐 Publié' : '🔒 Privé'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;