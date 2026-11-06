import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './NewDevis.css'; // On réutilise le CSS du formulaire de création

const EditDevis = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    numeroDevis: '',
    nomClient: '',
    nomChantier: '',
    dateDevis: '',
    note: '',
  });
  const [fichierPDF, setFichierPDF] = useState(null);
  const [photoProfil, setPhotoProfil] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les données actuelles du devis
  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/devis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentDevis = res.data.find(d => d._id === id);
        if (currentDevis) {
          setFormData({
            numeroDevis: currentDevis.numeroDevis,
            nomClient: currentDevis.nomClient,
            nomChantier: currentDevis.nomChantier,
            dateDevis: currentDevis.dateDevis.split('T')[0],
            note: currentDevis.note || '',
          });
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchDevis();
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('numeroDevis', formData.numeroDevis);
    data.append('nomClient', formData.nomClient);
    data.append('nomChantier', formData.nomChantier);
    data.append('dateDevis', formData.dateDevis);
    data.append('note', formData.note);
    
    // On ajoute les fichiers seulement s'ils ont été changés
    if (fichierPDF) data.append('fichierPDF', fichierPDF);
    if (photoProfil) data.append('photoProfil', photoProfil);

    try {
      await axios.put(`http://localhost:3000/api/devis/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Chargement...</p>;

  return (
    <div className="new-devis-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Modifier le Devis</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/')} className="btn-secondary">← Annuler</button>
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
                <input type="text" name="numeroDevis" required value={formData.numeroDevis} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date du devis *</label>
                <input type="date" name="dateDevis" required value={formData.dateDevis} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nom du client *</label>
                <input type="text" name="nomClient" required value={formData.nomClient} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Nom du chantier *</label>
                <input type="text" name="nomChantier" required value={formData.nomChantier} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Note / Mention (Optionnel)</label>
              <textarea name="note" rows="3" value={formData.note} onChange={handleChange}></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Remplacer le PDF (Optionnel)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setFichierPDF(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label>Remplacer la Photo (Optionnel)</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoProfil(e.target.files[0])} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}>
              {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditDevis;