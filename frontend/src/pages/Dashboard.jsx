import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, PlusSquare, Users, Moon, Sun, LogOut, 
  Eye, Download, RefreshCw, Globe, Lock, Pencil, Trash2 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const Dashboard = () => {
  // ... (toute la logique useState, useEffect, fetchDevis, handle... reste identique)
  // ... (Je ne remets que le JSX pour la clarté, la logique est inchangée)

  return (
    <div className="app-layout">
      {/* SIDEBAR (Visible uniquement sur PC) */}
      <aside className="sidebar desktop-only">
        <div className="sidebar-brand">Gestion Devis</div>
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

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <header className="top-bar">
          <div className="user-greeting">
            <p className="greeting-text">Bonjour,</p>
            <h1 className="user-name">{user?.name}</h1>
          </div>
          <div className="top-bar-actions desktop-only">
            {/* Boutons d'action rapide pour PC */}
          </div>
        </header>

        <div className="content-body">
          {/* CARTE KPI PRINCIPALE */}
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

          {/* LISTE DES DEVIS */}
          <div className="devis-list">
            {devisList.map((devis) => (
              <div key={devis._id} className="devis-row-card">
                <div className="row-main-info">
                  <img src={`https://zero1-gestion-devis.onrender.com/${devis.photoProfil}`} alt="Profil" className="row-avatar" onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                  <div className="row-text">
                    <h3>{devis.numeroDevis} <span className={`badge ${devis.statut === 'termine' ? 'badge-green' : 'badge-orange'}`}>{devis.statut === 'termine' ? 'Terminé' : 'En cours'}</span></h3>
                    <p>{devis.nomClient} — {devis.nomChantier}</p>
                  </div>
                </div>
                <div className="row-actions">
                  <a href={`https://zero1-gestion-devis.onrender.com/${devis.fichierPDF}`} target="_blank" rel="noreferrer" className="icon-btn" title="Lire"><Eye size={18} /></a>
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