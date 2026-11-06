# 01 — Gestion Devis (PWA)

Application web progressive (PWA) de gestion des devis et BAT.

## 🚀 Fonctionnalités

- Authentification sécurisée (JWT + Bcrypt).
- Gestion des rôles : Admin, Secrétaire, Technicien, Consultation.
- Création de devis avec upload de PDF et compression d'image (Sharp).
- Système de publication (visibilité pour les techniciens).
- Gestion des statuts (En cours / Terminé).
- Recherche et filtres.
- Gestion des comptes utilisateurs par l'admin.
- Mode Sombre / Clair.
- Installable sur PC et mobile (PWA).

## 🛠️ Stack Technique

- **Frontend** : React (Vite) + React Router + Axios + Context API
- **Backend** : Node.js + Express + Mongoose
- **Base de données** : MongoDB (via Docker)
- **Sécurité** : JWT, Bcrypt
- **Fichiers** : Multer + Sharp

## 💻 Démarrage Rapide

### 1. Prérequis

- Node.js >= 20
- Docker & Docker Compose

### 2. Installation

```bash
npm install
```
