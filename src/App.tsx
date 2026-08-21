import { useEffect, useState } from 'react'
import {
  importRecipe,
  type ImportedRecipe,
} from './import/recipeImport'
import {
  db,
  type Recipe,
} from './db/database'
import './App.css'

type View = 'home' | 'recipes' | 'favorites'

function App() {
  const [view, setView] = useState<View>('home')

  const [showImport, setShowImport] = useState(false)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  const [selectedRecipe, setSelectedRecipe] =
    useState<Recipe | null>(null)

  const [showEdit, setShowEdit] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editServings, setEditServings] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editIngredients, setEditIngredients] = useState('')
  const [editPreparation, setEditPreparation] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newServings, setNewServings] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newIngredients, setNewIngredients] = useState('')
  const [newPreparation, setNewPreparation] = useState('')
  const [newRecipeMessage, setNewRecipeMessage] = useState('')

  const [importUrl, setImportUrl] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  const [recipePreview, setRecipePreview] =
    useState<ImportedRecipe | null>(null)

  const [recipes, setRecipes] = useState<Recipe[]>([])

  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'existing' | 'error'
  >('idle')

  useEffect(() => {
    loadRecipes()
  }, [])

  async function loadRecipes() {
    const storedRecipes = await db.recipes
      .orderBy('title')
      .toArray()

    setRecipes(storedRecipes)
  }

  function durationToMinutes(value?: string) {
    if (!value) return undefined

    const hours = value.match(/(\d+)H/)
    const minutes = value.match(/(\d+)M/)

    const total =
      Number(hours?.[1] ?? 0) * 60 +
      Number(minutes?.[1] ?? 0)

    return total || undefined
  }

  function getServings(value?: string | string[]) {
    if (!value) return undefined

    const text = Array.isArray(value)
      ? value.join(' ')
      : value

    const match = text.match(/\d+/)

    return match ? Number(match[0]) : undefined
  }

  async function handleImport() {
    setImportLoading(true)
    setImportMessage('')
    setRecipePreview(null)
    setSaveStatus('idle')

    const result = await importRecipe(importUrl)

    if (result.success && result.recipe) {
      setRecipePreview(result.recipe)
      setSourceUrl(result.sourceUrl)
      setSourceName(result.sourceName ?? '')

      setImportMessage(
        `Rezept erkannt – Quelle: ${result.sourceName ?? ''}`,
      )
    } else {
      setImportMessage(
        result.error ?? 'Das Rezept konnte nicht eingelesen werden.',
      )
    }

    setImportLoading(false)
  }

  async function saveImportedRecipe() {
    if (!recipePreview) return

    try {
      setSaveStatus('saving')

      const existing = await db.recipes
        .where('title')
        .equals(recipePreview.title)
        .first()

      if (existing && existing.sourceUrl === sourceUrl) {
        setSaveStatus('existing')
        return
      }

      const now = new Date()

      await db.recipes.add({
        title: recipePreview.title,
        description: '',
        categoryIds: [],
        collectionIds: [],

        ingredients: recipePreview.ingredients.map(
          (ingredient, index) => ({
            id: `${Date.now()}-${index}`,
            name: ingredient,
          }),
        ),

        preparation: recipePreview.instructions,

        servings: getServings(recipePreview.yield),

        servingsLabel: Array.isArray(recipePreview.yield)
          ? recipePreview.yield.join(', ')
          : recipePreview.yield,

        prepTimeMinutes: durationToMinutes(
          recipePreview.prepTime,
        ),

        cookingTimeMinutes: durationToMinutes(
          recipePreview.cookTime,
        ),

        totalTimeMinutes: durationToMinutes(
          recipePreview.totalTime,
        ),

        sourceUrl,
        sourceName,
        sourceImageUrl: recipePreview.image,

        imageIds: [],
        favorite: false,

        createdAt: now,
        updatedAt: now,
      })

      setSaveStatus('saved')
      await loadRecipes()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      setSaveStatus('error')
    }
  }

  function saveButtonText() {
    switch (saveStatus) {
      case 'saving':
        return 'Rezept wird gespeichert …'
      case 'saved':
        return '✓ Rezept gespeichert'
      case 'existing':
        return '✓ Bereits gespeichert'
      case 'error':
        return 'Speichern fehlgeschlagen'
      default:
        return 'Rezept übernehmen'
    }
  }

  async function toggleFavorite() {
    if (!selectedRecipe?.id) return

    const newValue = !selectedRecipe.favorite
    const updatedAt = new Date()

    await db.recipes.update(selectedRecipe.id, {
      favorite: newValue,
      updatedAt,
    })

    setSelectedRecipe({
      ...selectedRecipe,
      favorite: newValue,
      updatedAt,
    })

    await loadRecipes()
  }

  async function deleteRecipe() {
    if (!selectedRecipe?.id) return

    const confirmed = window.confirm(
      `Möchtest du "${selectedRecipe.title}" wirklich löschen?`,
    )

    if (!confirmed) return

    await db.recipes.delete(selectedRecipe.id)

    setSelectedRecipe(null)
    await loadRecipes()
  }

  function openEdit() {
    if (!selectedRecipe) return

    setEditTitle(selectedRecipe.title)
    setEditServings(selectedRecipe.servingsLabel ?? '')

    setEditTime(
      selectedRecipe.totalTimeMinutes
        ? String(selectedRecipe.totalTimeMinutes)
        : '',
    )

    setEditIngredients(
      (selectedRecipe.ingredients ?? [])
        .map((ingredient) => ingredient.name)
        .join('\n'),
    )

    setEditPreparation(
      (selectedRecipe.preparation ?? []).join('\n'),
    )

    setShowEdit(true)
  }

  async function saveEdit() {
    if (!selectedRecipe?.id) return

    const ingredients = editIngredients
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `${Date.now()}-${index}`,
        name,
      }))

    const preparation = editPreparation
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const parsedTime = Number(editTime)

    await db.recipes.update(selectedRecipe.id, {
      title: editTitle.trim() || selectedRecipe.title,
      servingsLabel: editServings.trim() || undefined,

      totalTimeMinutes:
        Number.isFinite(parsedTime) && parsedTime > 0
          ? parsedTime
          : undefined,

      ingredients,
      preparation,
      updatedAt: new Date(),
    })

    const updated = await db.recipes.get(
      selectedRecipe.id,
    )

    if (updated) {
      setSelectedRecipe(updated)
    }

    setShowEdit(false)
    await loadRecipes()
  }

  function openNewRecipe() {
    setNewTitle('')
    setNewServings('')
    setNewTime('')
    setNewIngredients('')
    setNewPreparation('')
    setNewRecipeMessage('')
    setShowNewRecipe(true)
  }

  async function saveNewRecipe() {
    const title = newTitle.trim()

    if (!title) {
      setNewRecipeMessage(
        'Bitte einen Rezeptnamen eingeben.',
      )
      return
    }

    const ingredients = newIngredients
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `${Date.now()}-${index}`,
        name,
      }))

    const preparation = newPreparation
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const parsedTime = Number(newTime)
    const now = new Date()

    const newId = await db.recipes.add({
      title,
      description: '',

      categoryIds: [],
      collectionIds: [],

      ingredients,
      preparation,

      servingsLabel:
        newServings.trim() || undefined,

      totalTimeMinutes:
        Number.isFinite(parsedTime) && parsedTime > 0
          ? parsedTime
          : undefined,

      imageIds: [],
      favorite: false,

      createdAt: now,
      updatedAt: now,
    })

    await loadRecipes()

    const createdRecipe = await db.recipes.get(newId)

    setShowNewRecipe(false)
    setView('recipes')

    if (createdRecipe) {
      setSelectedRecipe(createdRecipe)
    }
  }

  function renderRecipeGrid(list: Recipe[]) {
    if (list.length === 0) {
      return (
        <div className="empty-recipes">
          {view === 'favorites'
            ? 'Du hast noch keine Favoriten markiert.'
            : 'Noch keine Rezepte gespeichert.'}
        </div>
      )
    }

    return (
      <div className="recipe-grid">
        {list.map((recipe) => (
          <button
            type="button"
            className="recipe-card recipe-card-button"
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
          >
            {recipe.sourceImageUrl ? (
              <img
                src={recipe.sourceImageUrl}
                alt={recipe.title}
                className="recipe-card-image"
              />
            ) : (
              <div className="recipe-card-placeholder">
                🍽️
              </div>
            )}

            <div className="recipe-card-content">
              <div className="recipe-card-title-row">
                <h3>{recipe.title}</h3>

                {recipe.favorite && (
                  <span className="favorite-mark">
                    ❤️
                  </span>
                )}
              </div>

              {recipe.servingsLabel && (
                <p>👥 {recipe.servingsLabel}</p>
              )}

              {recipe.totalTimeMinutes && (
                <p>
                  ⏱️ {recipe.totalTimeMinutes} Min.
                </p>
              )}

              {recipe.sourceName && (
                <p className="recipe-source">
                  Quelle: {recipe.sourceName}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  const favoriteRecipes = recipes.filter(
    (recipe) => recipe.favorite,
  )

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
          <p className="subtitle">
            meine Rezeptbox
          </p>
        </div>
      </header>

      <main className="content">
        {selectedRecipe ? (
          <section className="recipe-detail">
            <div className="recipe-detail-toolbar">
              <button
                className="back-button"
                type="button"
                onClick={() => setSelectedRecipe(null)}
              >
                ← Zurück
              </button>

              <div className="recipe-actions">
                <button
                  className="favorite-button"
                  type="button"
                  onClick={toggleFavorite}
                >
                  {selectedRecipe.favorite
                    ? '❤️ Favorit'
                    : '🤍 Favorit'}
                </button>

                <button
                  className="edit-button"
                  type="button"
                  onClick={openEdit}
                >
                  ✏️ Bearbeiten
                </button>

                <button
                  className="delete-button"
                  type="button"
                  onClick={deleteRecipe}
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>

            {selectedRecipe.sourceImageUrl && (
              <img
                src={selectedRecipe.sourceImageUrl}
                alt={selectedRecipe.title}
                className="recipe-detail-image"
              />
            )}

            <h2>{selectedRecipe.title}</h2>

            <div className="recipe-detail-meta">
              {selectedRecipe.servingsLabel && (
                <span>
                  👥 {selectedRecipe.servingsLabel}
                </span>
              )}

              {selectedRecipe.totalTimeMinutes && (
                <span>
                  ⏱️ {selectedRecipe.totalTimeMinutes} Min.
                </span>
              )}
            </div>

            <div className="recipe-detail-section">
              <h3>Zutaten</h3>

              {(selectedRecipe.ingredients ?? []).length >
              0 ? (
                <ul>
                  {(selectedRecipe.ingredients ?? []).map(
                    (ingredient) => (
                      <li key={ingredient.id}>
                        {ingredient.name}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>Keine Zutaten gespeichert.</p>
              )}
            </div>

            <div className="recipe-detail-section">
              <h3>Zubereitung</h3>

              {(selectedRecipe.preparation ?? []).length >
              0 ? (
                <ol>
                  {(selectedRecipe.preparation ?? []).map(
                    (step, index) => (
                      <li key={index}>{step}</li>
                    ),
                  )}
                </ol>
              ) : (
                <p>
                  Keine Zubereitung gespeichert.
                </p>
              )}
            </div>

            {selectedRecipe.sourceUrl && (
              <div className="recipe-detail-source">
                Quelle:{' '}
                <a
                  href={selectedRecipe.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedRecipe.sourceName ??
                    selectedRecipe.sourceUrl}
                </a>
              </div>
            )}
          </section>
        ) : view === 'home' ? (
          <>
            <section className="welcome">
              <h2>
                Was möchtest du kochen?
              </h2>

              <input
                className="search"
                type="search"
                placeholder="Rezepte und Zutaten durchsuchen …"
              />
            </section>

            <section className="quick-actions">
              <button
                className="card"
                type="button"
                onClick={() =>
                  setView('recipes')
                }
              >
                <span className="icon">📖</span>
                <strong>Rezepte</strong>
                <span>
                  Alle Rezepte ansehen
                </span>
              </button>

              <button
                className="card"
                type="button"
              >
                <span className="icon">
                  🗂️
                </span>
                <strong>Kategorien</strong>
                <span>
                  Rezepte nach Kategorien
                </span>
              </button>

              <button
                className="card"
                type="button"
              >
                <span className="icon">
                  📚
                </span>
                <strong>Sammlungen</strong>
                <span>
                  Eigene Rezeptsammlungen
                </span>
              </button>

              <button
                className="card"
                type="button"
                onClick={() =>
                  setView('favorites')
                }
              >
                <span className="icon">
                  ❤️
                </span>

                <strong>Favoriten</strong>

                <span>
                  {favoriteRecipes.length === 0
                    ? 'Deine Lieblingsrezepte'
                    : `${favoriteRecipes.length} ${
                        favoriteRecipes.length === 1
                          ? 'Lieblingsrezept'
                          : 'Lieblingsrezepte'
                      }`}
                </span>
              </button>
            </section>

            <section className="main-actions">
              <button
                className="primary"
                type="button"
                onClick={openNewRecipe}
              >
                ＋ Neues Rezept
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setImportMessage('')
                  setRecipePreview(null)
                  setSaveStatus('idle')
                  setShowImport(true)
                }}
              >
                ⇩ Rezept importieren
              </button>
            </section>
          </>
        ) : (
          <section className="recipes-view">
            <div className="recipes-header">
              <button
                className="back-button"
                type="button"
                onClick={() =>
                  setView('home')
                }
              >
                ← Zurück
              </button>

              <div>
                <h2>
                  {view === 'favorites'
                    ? 'Meine Favoriten'
                    : 'Meine Rezepte'}
                </h2>

                <p>
                  {view === 'favorites'
                    ? favoriteRecipes.length
                    : recipes.length}{' '}
                  {(view === 'favorites'
                    ? favoriteRecipes.length
                    : recipes.length) === 1
                    ? 'Rezept'
                    : 'Rezepte'}
                </p>
              </div>
            </div>

            {renderRecipeGrid(
              view === 'favorites'
                ? favoriteRecipes
                : recipes,
            )}
          </section>
        )}
      </main>

      <footer>
        Kochwerk v0.1.0
      </footer>

      {showImport && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowImport(false)
          }
        >
          <div
            className="import-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              type="button"
              onClick={() =>
                setShowImport(false)
              }
            >
              ×
            </button>

            <h2>Rezept importieren</h2>

            <p>
              Füge den Link zu einer
              Rezept-Webseite ein.
            </p>

            <input
              className="import-input"
              type="url"
              value={importUrl}
              onChange={(event) => {
                setImportUrl(event.target.value)
                setImportMessage('')
                setRecipePreview(null)
                setSaveStatus('idle')
              }}
              placeholder="https://..."
            />

            <button
              className="import-button"
              type="button"
              disabled={
                !importUrl.trim() ||
                importLoading
              }
              onClick={handleImport}
            >
              {importLoading
                ? 'Rezept wird eingelesen …'
                : 'Rezept einlesen'}
            </button>

            {importMessage && (
              <p className="import-message">
                {importMessage}
              </p>
            )}

            {recipePreview && (
              <div className="recipe-preview">
                {recipePreview.image && (
                  <img
                    src={recipePreview.image}
                    alt={recipePreview.title}
                    className="preview-image"
                  />
                )}

                <h3>
                  {recipePreview.title}
                </h3>

                <h4>Zutaten</h4>

                <ul>
                  {recipePreview.ingredients.map(
                    (ingredient, index) => (
                      <li key={index}>
                        {ingredient}
                      </li>
                    ),
                  )}
                </ul>

                <h4>Zubereitung</h4>

                <ol>
                  {recipePreview.instructions.map(
                    (instruction, index) => (
                      <li key={index}>
                        {instruction}
                      </li>
                    ),
                  )}
                </ol>

                <button
                  className="save-recipe-button"
                  type="button"
                  disabled={
                    saveStatus === 'saving' ||
                    saveStatus === 'saved' ||
                    saveStatus === 'existing'
                  }
                  onClick={saveImportedRecipe}
                >
                  {saveButtonText()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showNewRecipe && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewRecipe(false)
          }
        >
          <div
            className="edit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              type="button"
              onClick={() =>
                setShowNewRecipe(false)
              }
            >
              ×
            </button>

            <h2>Neues Rezept</h2>

            <label>
              Rezeptname
              <input
                value={newTitle}
                onChange={(event) => {
                  setNewTitle(
                    event.target.value,
                  )
                  setNewRecipeMessage('')
                }}
                placeholder="z. B. Apfelkuchen"
              />
            </label>

            <label>
              Portionen / Menge
              <input
                value={newServings}
                onChange={(event) =>
                  setNewServings(
                    event.target.value,
                  )
                }
                placeholder="z. B. 4 Personen"
              />
            </label>

            <label>
              Gesamtzeit in Minuten
              <input
                type="number"
                value={newTime}
                onChange={(event) =>
                  setNewTime(
                    event.target.value,
                  )
                }
                placeholder="z. B. 45"
              />
            </label>

            <label>
              Zutaten – eine Zeile pro Zutat
              <textarea
                value={newIngredients}
                onChange={(event) =>
                  setNewIngredients(
                    event.target.value,
                  )
                }
                rows={10}
                placeholder={
                  '500 g Kartoffeln\n2 Eier\n1 TL Salz'
                }
              />
            </label>

            <label>
              Zubereitung – ein Schritt pro Zeile
              <textarea
                value={newPreparation}
                onChange={(event) =>
                  setNewPreparation(
                    event.target.value,
                  )
                }
                rows={10}
                placeholder={
                  'Kartoffeln schälen.\nZutaten vermischen.\nIm Ofen backen.'
                }
              />
            </label>

            {newRecipeMessage && (
              <p className="import-message">
                {newRecipeMessage}
              </p>
            )}

            <button
              className="save-recipe-button"
              type="button"
              onClick={saveNewRecipe}
            >
              Rezept speichern
            </button>
          </div>
        </div>
      )}

      {showEdit && selectedRecipe && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowEdit(false)
          }
        >
          <div
            className="edit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              type="button"
              onClick={() =>
                setShowEdit(false)
              }
            >
              ×
            </button>

            <h2>Rezept bearbeiten</h2>

            <label>
              Titel
              <input
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Portionen
              <input
                value={editServings}
                onChange={(event) =>
                  setEditServings(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Gesamtzeit in Minuten
              <input
                type="number"
                value={editTime}
                onChange={(event) =>
                  setEditTime(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Zutaten – eine Zeile pro Zutat
              <textarea
                value={editIngredients}
                onChange={(event) =>
                  setEditIngredients(
                    event.target.value,
                  )
                }
                rows={10}
              />
            </label>

            <label>
              Zubereitung – ein Schritt pro Zeile
              <textarea
                value={editPreparation}
                onChange={(event) =>
                  setEditPreparation(
                    event.target.value,
                  )
                }
                rows={10}
              />
            </label>

            <button
              className="save-recipe-button"
              type="button"
              onClick={saveEdit}
            >
              Änderungen speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App