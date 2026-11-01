import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gestion Devis</h1>
        <p className="app-subtitle">PWA de gestion des devis et BAT</p>
      </header>

      <main className="app-main">
        <section className="app-card">
          <h2>Bienvenue</h2>
          <p>
            Cette application permet de centraliser les devis, retrouver les BAT
            PDF et gérer les autorisations d'accès.
          </p>
          <p className="app-status">
            <span className="status-dot"></span>
            Étape 1.2.c — Template nettoyé
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <p>v0.1.0 — Projet 01-gestion-devis</p>
      </footer>
    </div>
  )
}

export default App