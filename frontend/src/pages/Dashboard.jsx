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

  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const url = `https://zero1-gestion-devis.onrender.com/api/devis?search=${search}&statut=${filtreStatut}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevisList(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevis();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filtreStatut, token]);

  // --- ACTIONS ---
  const handleTogglePublish = async (id) => {
    try {
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/devis/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevis();
    } catch (err) {
      alert("Erreur lors de la publication");
    }
  };

  const handleToggleStatus = async (id, currentStatut) => {
    const newStatut = currentStatut === 'termine' ? 'en_cours' : 'termine';
    try {
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/devis/${id}/status`, { statut: newStatut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevis();
    } catch (err) {
      alert("Erreur lors du changement de statut");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.")) {
      try {
        await axios.delete(`https://zero1-gestion-devis.onrender.com/api/devis/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDevis();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- CALCUL DES STATISTIQUES ---
  const totalDevis = devisList.length;
  const devisEnCours = devisList.filter(d => d.statut === 'en_cours').length;
  const devisTermines = devisList.filter(d => d.statut === 'termine').length;
  const devisPublies = devisList.filter(d => d.isPublished).length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Gestion Devis</h1>
          <span className="user-badge">{user?.name} ({user?.role})</span>
        </div>
        
        <div className="header-right">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin/users')} className="btn-secondary">
              👥 Gérer les comptes
            </button>
          )}
          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* STATISTIQUES */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total des devis</span>
            <span className="stat-value">{totalDevis}</span>
          </div>
          <div className="stat-card stat-orange">
            <span className="stat-label">En cours</span>
            <span className="stat-value">{devisEnCours}</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-label">Terminés</span>
            <span className="stat-value">{devisTermines}</span>
          </div>
          <div className="stat-card stat-blue">
            <span className="stat-label">Publiés</span>
            <span className="stat-value">{devisPublies}</span>
          </div>
        </div>

        <div className="main-header">
          <h2>Liste des devis</h2>
          {(user?.role === 'admin' || user?.role === 'secretaire') && (
            <button className="btn-primary" onClick={() => navigate('/devis/nouveau')}>
              + Nouveau devis
            </button>
          )}
        </div>

        <div className="toolbar">
          <input 
            type="text" 
            placeholder="Rechercher par numéro, client ou chantier..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select 
            value={filtreStatut} 
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>

        {loading && <p className="loading-text">Chargement...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="devis-grid">
          {devisList.length === 0 && !loading && (
            <p>Aucun devis trouvé.</p>
          )}

          {devisList.map((devis) => (
            <div key={devis._id} className="devis-card">
              <div className="card-image">
                <img 
                  src={`https://zero1-gestion-devis.onrender.com/${devis.photoProfil}`} 
                  alt="Profil" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Photo'; }}
                />
              </div>

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

                {/* BOUTONS LIRE / TÉLÉCHARGER */}
                <div className="card-actions" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <a 
                    href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-action btn-view"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    👁️ Lire
                  </a>
                  <a 
                    href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} 
                    download
                    className="btn-action btn-download"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    ⬇️ Télécharger
                  </a>
                </div>

                {/* BOUTONS ADMIN/SECRÉTAIRE */}
                {(user?.role === 'admin' || user?.role === 'secretaire') && (
                  <>
                    <div className="card-actions" style={{ marginTop: '0.5rem', borderTop: 'none', paddingTop: '0' }}>
                      <button onClick={() => handleToggleStatus(devis._id, devis.statut)} className="btn-action btn-status">
                        {devis.statut === 'termine' ? 'Rouvrir' : 'Clôturer'}
                      </button>
                      <button onClick={() => handleTogglePublish(devis._id)} className={`btn-action ${devis.isPublished ? 'btn-unpublish' : 'btn-publish'}`}>
                        {devis.isPublished ? 'Dépublier' : 'Publier'}
                      </button>
                    </div>
                    <div className="card-actions" style={{ marginTop: '0.5rem', borderTop: 'none', paddingTop: '0' }}>
                      <button onClick={() => navigate(`/devis/${devis._id}/modifier`)} className="btn-action btn-status">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(devis._id)} className="btn-action btn-unpublish">
                        🗑️ Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;