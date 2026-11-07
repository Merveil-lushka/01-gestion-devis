import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // On importe le CSS du dashboard pour avoir les classes

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
      const res = await axios.get('https://zero1-gestion-devis.onrender.com/api/users', {
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
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/users/${id}/status`, {}, {
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
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/users/${id}/reset-password`, { newPassword }, {
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
      await axios.post('https://zero1-gestion-devis.onrender.com/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ name: '', email: '', password: '', role: 'consultation' });
      setShowForm(false);
      fetchUsers();
      alert('Utilisateur créé avec succès');
    } catch (err) {
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
          <button onClick={() => navigate('/')} className="btn-secondary">← Tableau de bord</button>
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
          <form onSubmit={handleCreateUser} className="admin-create-form">
            <input type="text" placeholder="Nom" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
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

        {/* LISTE DES UTILISATEURS (Avec les nouvelles classes CSS) */}
        <div className="users-list">
          {users.map((u) => (
            <div key={u._id} className="user-row" style={{ opacity: u.isActive ? 1 : 0.6 }}>
              <div className="user-info">
                <h3>{u.name}</h3>
                <p>{u.email}</p>
              </div>
              <div className="user-actions">
                <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>{u.role}</span>
                <span className={`badge ${u.isActive ? 'badge-green' : 'badge-orange'}`}>
                  {u.isActive ? 'Actif' : 'Inactif'}
                </span>
                
                <button onClick={() => handleResetPassword(u._id)} className="btn-action btn-status">Réinit. MDP</button>
                <button 
                  onClick={() => handleToggleStatus(u._id)} 
                  className={`btn-action ${u.isActive ? 'btn-unpublish' : 'btn-publish'}`}
                  disabled={u._id === currentUser._id}
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