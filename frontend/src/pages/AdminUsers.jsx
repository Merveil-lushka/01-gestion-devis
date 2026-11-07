import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, PlusSquare, Users, Moon, Sun, LogOut, Key, UserX, UserCheck, Shield } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import './AdminUsers.css';

const AdminUsers = () => {
  const { token, user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'consultation' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://zero1-gestion-devis.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/users/${id}/status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "Erreur"); }
  };

  const handleResetPassword = async (id) => {
    const newPassword = prompt("Entrez le nouveau mot de passe (min. 6 caractères) :");
    if (!newPassword) return;
    try {
      await axios.patch(`https://zero1-gestion-devis.onrender.com/api/users/${id}/reset-password`, { newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Mot de passe réinitialisé avec succès');
    } catch (err) { alert(err.response?.data?.message || "Erreur"); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://zero1-gestion-devis.onrender.com/api/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      setNewUser({ name: '', email: '', password: '', role: 'consultation' });
      setShowForm(false);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "Erreur lors de la création"); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* SIDEBAR PC */}
      <aside className="sidebar desktop-only">
        <div className="sidebar-brand">TeamKarmagrippa</div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/')}><Home size={20} /> Tableau de bord</button>
          <button className="sidebar-link" onClick={() => navigate('/devis/nouveau')}><PlusSquare size={20} /> Nouveau devis</button>
          <button className="sidebar-link active"><Users size={20} /> Gestion des comptes</button>
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
            <p className="greeting-text">Administration</p>
            <h1 className="user-name">Gestion des comptes</h1>
          </div>
          <button className="btn-primary desktop-only" onClick={() => setShowForm(!showForm)}>
            <PlusSquare size={18} /> {showForm ? 'Fermer' : 'Nouvel utilisateur'}
          </button>
        </header>

        <div className="content-body">
          
          {/* FORMULAIRE DE CRÉATION */}
          {showForm && (
            <form onSubmit={handleCreateUser} className="admin-form-card">
              <h3>Créer un compte</h3>
              <div className="form-grid">
                <input type="text" placeholder="Nom complet" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input type="email" placeholder="Adresse email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <input type="password" placeholder="Mot de passe" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="consultation">Consultation</option>
                  <option value="technicien">Technicien</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Créer l'utilisateur</button>
              </div>
            </form>
          )}

          {loading && <p>Chargement...</p>}
          {error && <p className="text-red">{error}</p>}

          {/* LISTE DES UTILISATEURS */}
          <div className="users-list">
            {users.map((u) => (
              <div key={u._id} className="user-row-card">
                <div className="row-main-info">
                  <div className="user-avatar-icon"><Shield size={20} /></div>
                  <div className="row-text">
                    <h3>{u.name} <span className={`badge role-${u.role}`}>{u.role}</span></h3>
                    <p>{u.email}</p>
                  </div>
                </div>
                
                <div className="row-actions">
                  <span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`} title={u.isActive ? 'Actif' : 'Inactif'}></span>
                  <button onClick={() => handleResetPassword(u._id)} className="icon-btn" title="Réinitialiser mot de passe"><Key size={18} /></button>
                  <button 
                    onClick={() => handleToggleStatus(u._id)} 
                    className={`icon-btn ${u.isActive ? 'text-red' : 'text-green'}`}
                    disabled={u._id === currentUser._id}
                    title={u.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton pour mobile car le bouton pc est caché */}
          <button className="btn-primary mobile-only" onClick={() => setShowForm(!showForm)} style={{marginTop: '1rem', width: '100%'}}>
            {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
          </button>

        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AdminUsers;