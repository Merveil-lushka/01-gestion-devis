import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulaire de création
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'consultation' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Activer / Désactiver un compte
  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/users/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (id) => {
    const newPassword = prompt("Entrez le nouveau mot de passe (min. 6 caractères) :");
    if (!newPassword) return;

    try {
      await axios.patch(`http://localhost:3000/api/users/${id}/reset-password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mot de passe réinitialisé avec succès');
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // Créer un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ name: '', email: '', password: '', role: 'consultation' });
      setShowForm(false);
      fetchUsers();
      alert('Utilisateur créé avec succès');
    } catch (err) {
      // On affiche le message précis envoyé par le backend (ex: "Cet email est déjà utilisé")
      alert(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Gestion des comptes</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/')} className="btn-secondary">← Retour au tableau de bord</button>
          <button onClick={toggleTheme} className="btn-icon">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="main-header">
          <h2>Utilisateurs</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
          </button>
        </div>

        {/* FORMULAIRE DE CRÉATION */}
        {showForm && (
          <form onSubmit={handleCreateUser} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nom" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <option value="consultation">Consultation</option>
              <option value="technicien">Technicien</option>
              <option value="secretaire">Secrétaire</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-primary">Créer</button>
          </form>
        )}

        {loading && <p>Chargement...</p>}
        {error && <p className="error-text">{error}</p>}

        {/* LISTE DES UTILISATEURS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((u) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: u.isActive ? 1 : 0.6 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{u.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>{u.role}</span>
                <span className={`badge ${u.isActive ? 'badge-green' : 'badge-orange'}`}>
                  {u.isActive ? 'Actif' : 'Inactif'}
                </span>
                
                <button onClick={() => handleResetPassword(u._id)} className="btn-action btn-status">Réinit. MDP</button>
                <button 
                  onClick={() => handleToggleStatus(u._id)} 
                  className={`btn-action ${u.isActive ? 'btn-unpublish' : 'btn-publish'}`}
                  disabled={u._id === currentUser._id} // Impossible de se désactiver soi-même
                  style={{ opacity: u._id === currentUser._id ? 0.3 : 1 }}
                >
                  {u.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;