import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';
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
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setDevisList(res.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchDevis(), 300);
    return () => clearTimeout(timer);
  }, [search, filtreStatut, token]);

  const handleTogglePublish = async (id) => {
    await axios.patch(`https://zero1-gestion-devis.onrender.com/api/devis/${id}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchDevis();
  };

  const handleToggleStatus = async (id, currentStatut) => {
    const newStatut = currentStatut === 'termine' ? 'en_cours' : 'termine';
    await axios.patch(`https://zero1-gestion-devis.onrender.com/api/devis/${id}/status`, { statut: newStatut }, { headers: { Authorization: `Bearer ${token}` } });
    fetchDevis();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce devis ?")) {
      await axios.delete(`https://zero1-gestion-devis.onrender.com/api/devis/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDevis();
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const totalDevis = devisList.length;
  const devisEnCours = devisList.filter(d => d.statut === 'en_cours').length;
  const devisTermines = devisList.filter(d => d.statut === 'termine').length;
  const devisPublies = devisList.filter(d => d.isPublished).length;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">👤</div>
          <div>
            <p className="greeting">Bonjour,</p>
            <h1 className="user-name">{user?.name}</h1>
          </div>
        </div>
        
        {/* Ces boutons ne s'afficheront que sur PC */}
        <div className="header-right desktop-only">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin/users')} className="btn-secondary">👥 Comptes</button>
          )}
          <button onClick={toggleTheme} className="btn-icon">{theme === 'light' ? '🌙' : '☀️'}</button>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* CARTE NOIRE PRINCIPALE (Style de l'image) */}
        <div className="main-balance-card">
          <p className="balance-label">Total des devis</p>
          <h2 className="balance-value">{totalDevis}</h2>
          <div className="balance-row">
            <div>
              <p className="balance-sub">En cours</p>
              <span className="balance-sub-value text-orange">{devisEnCours}</span>
            </div>
            <div>
              <p className="balance-sub">Terminés</p>
              <span className="balance-sub-value text-green">{devisTermines}</span>
            </div>
            <div>
              <p className="balance-sub">Publiés</p>
              <span className="balance-sub-value text-blue">{devisPublies}</span>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="toolbar">
          <input 
            type="text" 
            placeholder="Rechercher un devis..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="main-header">
          <h2>Liste des devis</h2>
          <select 
            value={filtreStatut} 
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>

        {loading && <p className="loading-text">Chargement...</p>}

        <div className="devis-grid">
          {devisList.map((devis) => (
            <div key={devis._id} className="devis-card">
              <div className="card-header">
                <div className="card-image-circle">
                  <img 
                    src={`https://zero1-gestion-devis.onrender.com/${devis.photoProfil}`} 
                    alt="Profil" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Photo'; }}
                  />
                </div>
                <div className="card-title-area">
                  <h3>{devis.numeroDevis}</h3>
                  <span className={`badge ${devis.statut === 'termine' ? 'badge-green' : 'badge-orange'}`}>
                    {devis.statut === 'termine' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </div>
              
              <div className="card-body">
                <p className="client-name">{devis.nomClient}</p>
                <p className="chantier-name">{devis.nomChantier}</p>
                <div className="card-meta">
                  <span className="date">📅 {new Date(devis.dateDevis).toLocaleDateString()}</span>
                  <span className={`publish-status ${devis.isPublished ? 'published' : 'unpublished'}`}>
                    {devis.isPublished ? '🌐 Publié' : '🔒 Privé'}
                  </span>
                </div>
              </div>

              {/* ACTIONS SUR LA CARTE */}
              <div className="card-actions-row">
                <a href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} target="_blank" rel="noreferrer" className="icon-btn">👁️</a>
                <a href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} download className="icon-btn">⬇️</a>
                {(user?.role === 'admin' || user?.role === 'secretaire') && (
                  <>
                    <button onClick={() => handleToggleStatus(devis._id, devis.statut)} className="icon-btn">🔄</button>
                    <button onClick={() => handleTogglePublish(devis._id)} className="icon-btn">{devis.isPublished ? '🔒' : '🌐'}</button>
                    <button onClick={() => navigate(`/devis/${devis._id}/modifier`)} className="icon-btn">✏️</button>
                    <button onClick={() => handleDelete(devis._id)} className="icon-btn text-red">🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* NAVIGATION MOBILE */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;