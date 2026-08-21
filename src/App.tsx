import { useState } from 'react'
import './App.css'

function App() {
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')

  return (
    <div className="app">
      <header className="header">
        <img
          src="/pwa-192x192.png"
          alt="Kochwerk"
          className="app-logo"
        />

        <div>
          <h1>Kochwerk</h1>
          <p className="subtitle">meine Rezeptbox</p>
        </div>
      </header>

      <main className="content">
        <section className="welcome">
          <h2>Was möchtest du kochen?</h2>

          <input
            className="search"
            type="search"
            placeholder="Rezepte und Zutaten durchsuchen …"
          />
        </section>

        <section className="quick-actions">
          <button className="card">
            <span className="icon">📖</span>
            <strong>Rezepte</strong>
            <span>Alle Rezepte ansehen</span>
          </button>

          <button className="card">
            <span className="icon">🗂️</span>
            <strong>Kategorien</strong>
            <span>Rezepte nach Kategorien</span>
          </button>

          <button className="card">
            <span className="icon">📚</span>
            <strong>Sammlungen</strong>
            <span>Eigene Rezeptsammlungen</span>
          </button>

          <button className="card">
            <span className="icon">❤️</span>
            <strong>Favoriten</strong>
            <span>Deine Lieblingsrezepte</span>
          </button>
        </section>

        <section className="main-actions">
          <button className="primary">
            ＋ Neues Rezept
          </button>

          <button
            className="secondary"
            onClick={() => setShowImport(true)}
          >
            ⇩ Rezept importieren
          </button>
        </section>
      </main>

      <footer>Kochwerk v0.1.0</footer>

      {showImport && (
        <div
          className="modal-backdrop"
          onClick={() => setShowImport(false)}
        >
          <div
            className="import-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowImport(false)}
              aria-label="Schließen"
            >
              ×
            </button>

            <h2>Rezept importieren</h2>

            <p>
              Füge den Link zu einer Rezept-Webseite ein.
            </p>

            <input
              className="import-input"
              type="url"
              value={importUrl}
              onChange={(event) => setImportUrl(event.target.value)}
              placeholder="https://www.beispiel.ch/rezept/..."
            />

            <button
              className="import-button"
              disabled={!importUrl.trim()}
            >
              Rezept einlesen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App