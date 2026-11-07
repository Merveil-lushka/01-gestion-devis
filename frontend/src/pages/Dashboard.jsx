import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, PlusSquare, Users, Moon, Sun, LogOut, 
  Eye, Download, RefreshCw, Globe, Lock, Pencil, Trash2, FileText 
} from 'lucide-react';
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
    <div className="app-layout">
      {/* SIDEBAR PC */}
      <aside className="sidebar desktop-only">
        <div className="sidebar-brand">TeamKarmagrippa</div>
        <nav className="sidebar-nav">
          <button className="sidebar-link active"><Home size={20} /> Tableau de bord</button>
          {(user?.role === 'admin' || user?.role === 'secretaire') && (
            <button className="sidebar-link" onClick={() => navigate('/devis/nouveau')}><PlusSquare size={20} /> Nouveau devis</button>
          )}
          {user?.role === 'admin' && (
            <button className="sidebar-link" onClick={() => navigate('/admin/users')}><Users size={20} /> Gestion des comptes</button>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} Thème
          </button>
          <button className="sidebar-link text-red" onClick={handleLogout}><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-bar desktop-only">
          <div className="user-greeting">
            <p className="greeting-text">Bonjour,</p>
            <h1 className="user-name">{user?.name}</h1>
          </div>
        </header>

        <div className="content-body">
          {/* 🚀 NOUVELLE BANNIÈRE HERO (Image de construction + Dégradé) */}
          <div className="hero-banner">
            <div className="hero-overlay">
              <h1 className="hero-brand">TeamKarmagrippa</h1>
              <p className="hero-slogan">Gérer et consulter les devis en toute simplicité.</p>
            </div>
          </div>

          {/* CARTE KPI NOIRE */}
          <div className="kpi-card">
            <div className="kpi-main">
              <span className="kpi-label">Total des devis</span>
              <span className="kpi-value">{totalDevis}</span>
            </div>
            <div className="kpi-breakdown">
              <div className="kpi-item">
                <span className="kpi-item-label">En cours</span>
                <span className="kpi-item-value text-orange">{devisEnCours}</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-item-label">Terminés</span>
                <span className="kpi-item-value text-green">{devisTermines}</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-item-label">Publiés</span>
                <span className="kpi-item-value text-blue">{devisPublies}</span>
              </div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE & FILTRE */}
          <div className="toolbar-row">
            <div className="search-box">
              <input type="text" placeholder="Rechercher un devis..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="filter-select">
              <option value="">Tous les statuts</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>

          {/* LISTE DES DEVIS (Avec Thumbnail PDF) */}
          {loading && <p>Chargement...</p>}
          {error && <p className="text-red">{error}</p>}
          
          <div className="devis-list">
            {devisList.map((devis) => (
              <div key={devis._id} className="devis-row-card">
                <div className="row-main-info">
                  {/* Thumbnail PDF à la place de l'image ronde */}
                  <div className="pdf-thumbnail">
                    <FileText size={20} className="pdf-icon" />
                    <span className="pdf-label">PDF</span>
                  </div>
                  
                  <div className="row-text">
                    <h3>{devis.numeroDevis} <span className={`badge ${devis.statut === 'termine' ? 'badge-green' : 'badge-orange'}`}>{devis.statut === 'termine' ? 'Terminé' : 'En cours'}</span></h3>
                    <p>{devis.nomClient} — {devis.nomChantier}</p>
                  </div>
                </div>
                <div className="row-actions">
                  <a href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} target="_blank" rel="noreferrer" className="icon-btn" title="Lire le PDF"><Eye size={18} /></a>
                  <a href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} download className="icon-btn" title="Télécharger"><Download size={18} /></a>
                  {(user?.role === 'admin' || user?.role === 'secretaire') && (
                    <>
                      <button onClick={() => handleToggleStatus(devis._id, devis.statut)} className="icon-btn" title="Changer statut"><RefreshCw size={18} /></button>
                      <button onClick={() => handleTogglePublish(devis._id)} className="icon-btn" title="Publier/Dépublier">{devis.isPublished ? <Lock size={18} /> : <Globe size={18} />}</button>
                      <button onClick={() => navigate(`/devis/${devis._id}/modifier`)} className="icon-btn" title="Modifier"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(devis._id)} className="icon-btn text-red" title="Supprimer"><Trash2 size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;