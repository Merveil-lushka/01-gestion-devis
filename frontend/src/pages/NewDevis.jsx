import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewDevis.css';

const NewDevis = () => {
  const { token } = useAuth();
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

    // On utilise FormData pour envoyer des fichiers
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
      navigate('/'); // Retour au dashboard si succès
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du devis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-devis-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Nouveau Devis</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/')} className="btn-secondary">← Retour</button>
          <button onClick={toggleTheme} className="btn-icon">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="form-card">
          <h2>Informations du devis</h2>
          
          {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="devis-form">
            <div className="form-row">
              <div className="form-group">
                <label>Numéro du devis *</label>
                <input type="text" name="numeroDevis" required value={formData.numeroDevis} onChange={handleChange} placeholder="DEV-2026-002" />
              </div>
              <div className="form-group">
                <label>Date du devis *</label>
                <input type="date" name="dateDevis" required value={formData.dateDevis} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nom du client *</label>
                <input type="text" name="nomClient" required value={formData.nomClient} onChange={handleChange} placeholder="Nom du client" />
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

            <div className="form-row">
              <div className="form-group">
                <label>Fichier PDF du BAT *</label>
                <input type="file" accept="application/pdf" onChange={(e) => setFichierPDF(e.target.files[0])} required />
              </div>
              <div className="form-group">
                <label>Photo de profil (Miniature) *</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoProfil(e.target.files[0])} required />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}>
              {loading ? 'Enregistrement et compression...' : 'Enregistrer le devis'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewDevis;