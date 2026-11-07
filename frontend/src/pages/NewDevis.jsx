import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, PlusSquare, Users, Moon, Sun, LogOut, Upload, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import './NewDevis.css';

const NewDevis = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numeroDevis: '',
    nomClient: '',
    nomChantier: '',
    dateDevis: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [fichierPDF, setFichierPDF] = useState(null);
  const [photoProfil, setPhotoProfil] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fichierPDF || !photoProfil) {
      return setError('Veuillez sélectionner le PDF du BAT et une photo de profil.');
    }

    setLoading(true);
    const data = new FormData();
    data.append('numeroDevis', formData.numeroDevis);
    data.append('nomClient', formData.nomClient);
    data.append('nomChantier', formData.nomChantier);
    data.append('dateDevis', formData.dateDevis);
    data.append('note', formData.note);
    data.append('fichierPDF', fichierPDF);
    data.append('photoProfil', photoProfil);

    try {
      await axios.post('https://zero1-gestion-devis.onrender.com/api/devis', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du devis');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* SIDEBAR PC */}
      <aside className="sidebar desktop-only">
        <div className="sidebar-brand">TeamKarmagrippa</div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/')}><Home size={20} /> Tableau de bord</button>
          <button className="sidebar-link active"><PlusSquare size={20} /> Nouveau devis</button>
          {user?.role === 'admin' && (
            <button className="sidebar-link" onClick={() => navigate('/admin/users')}><Users size={20} /> Gestion des comptes</button>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={toggleTheme}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} Thème</button>
          <button className="sidebar-link text-red" onClick={handleLogout}><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <header className="top-bar">
          <div className="user-greeting">
            <button onClick={() => navigate('/')} className="btn-back mobile-only">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="greeting-text">Devis</p>
              <h1 className="user-name">Nouveau devis</h1>
            </div>
          </div>
        </header>

        <div className="content-body">
          <div className="form-card">
            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="devis-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Numéro du devis *</label>
                  <input type="text" name="numeroDevis" required value={formData.numeroDevis} onChange={handleChange} placeholder="Ex: DEV-2026-002" />
                </div>
                <div className="form-group">
                  <label>Date du devis *</label>
                  <input type="date" name="dateDevis" required value={formData.dateDevis} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nom du client *</label>
                  <input type="text" name="nomClient" required value={formData.nomClient} onChange={handleChange} placeholder="Nom de l'entreprise" />
                </div>
                <div className="form-group">
                  <label>Nom du chantier *</label>
                  <input type="text" name="nomChantier" required value={formData.nomChantier} onChange={handleChange} placeholder="Lieu du chantier" />
                </div>
              </div>

              <div className="form-group">
                <label>Note / Mention (Optionnel)</label>
                <textarea name="note" rows="3" value={formData.note} onChange={handleChange} placeholder="Ex: Urgent, à traiter avant vendredi..."></textarea>
              </div>

              <div className="form-row upload-row">
                <div className="form-group file-group">
                  <label>Fichier PDF du BAT *</label>
                  <label className="file-upload-box">
                    <Upload size={20} />
                    <span>{fichierPDF ? fichierPDF.name : 'Choisir un PDF'}</span>
                    <input type="file" accept="application/pdf" onChange={(e) => setFichierPDF(e.target.files[0])} required />
                  </label>
                </div>
                <div className="form-group file-group">
                  <label>Photo de profil *</label>
                  <label className="file-upload-box">
                    <Upload size={20} />
                    <span>{photoProfil ? photoProfil.name : 'Choisir une image'}</span>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoProfil(e.target.files[0])} required />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer le devis'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default NewDevis;