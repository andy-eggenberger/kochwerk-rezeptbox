import './App.css'

function App() {
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

          <button className="secondary">
            ⇩ Rezept importieren
          </button>
        </section>
      </main>

      <footer>
        Kochwerk v0.1.0
      </footer>
    </div>
  )
}

export default App