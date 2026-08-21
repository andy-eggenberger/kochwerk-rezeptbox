import { useEffect, useState } from 'react'
import {
  importRecipe,
  type ImportedRecipe,
} from './import/recipeImport'
import {
  db,
  type Recipe,
  type Category,
  type Collection,
} from './db/database'
import './App.css'

type View =
  | 'home'
  | 'recipes'
  | 'favorites'
  | 'categories'
  | 'categoryRecipes'
  | 'collections'
  | 'collectionRecipes'
  | 'search'

const CATEGORY_ICONS = [
  '🍽️',
  '🥣',
  '🍲',
  '🥘',
  '🍛',
  '🍝',
  '🍜',
  '🍕',
  '🍔',
  '🌭',
  '🥪',
  '🌮',
  '🌯',
  '🥙',
  '🧆',
  '🥗',
  '🍚',
  '🍙',
  '🍱',
  '🥩',
  '🍗',
  '🍖',
  '🥓',
  '🐟',
  '🦐',
  '🦞',
  '🦀',
  '🥔',
  '🥕',
  '🌽',
  '🍅',
  '🥦',
  '🥬',
  '🥒',
  '🌶️',
  '🧅',
  '🧄',
  '🍄',
  '🫘',
  '🍞',
  '🥖',
  '🥐',
  '🥨',
  '🧀',
  '🍳',
  '🥚',
  '🧈',
  '🍰',
  '🎂',
  '🧁',
  '🥧',
  '🍪',
  '🍩',
  '🍫',
  '🍬',
  '🍭',
  '🍮',
  '🍨',
  '🍦',
  '🍧',
  '🍓',
  '🍒',
  '🍎',
  '🍐',
  '🍊',
  '🍋',
  '🍌',
  '🍉',
  '🍇',
  '🥝',
  '🍍',
  '🥭',
  '☕',
  '🫖',
  '🥤',
  '🧃',
  '🥛',
]

function App() {
  const [view, setView] = useState<View>('home')

  const [showImport, setShowImport] = useState(false)
  const [showNewRecipe, setShowNewRecipe] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [showNewCategory, setShowNewCategory] =
    useState(false)

  const [showEditCategory, setShowEditCategory] =
    useState(false)

  const [showNewCollection, setShowNewCollection] =
    useState(false)

  const [showEditCollection, setShowEditCollection] =
    useState(false)

  const [selectedRecipe, setSelectedRecipe] =
    useState<Recipe | null>(null)

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null)

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] =
    useState<Category[]>([])
  const [collections, setCollections] =
    useState<Collection[]>([])

  const [searchQuery, setSearchQuery] = useState('')

  const [editTitle, setEditTitle] = useState('')
  const [editServings, setEditServings] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editIngredients, setEditIngredients] =
    useState('')
  const [editPreparation, setEditPreparation] =
    useState('')

  const [editCategoryIds, setEditCategoryIds] =
    useState<number[]>([])

  const [editCollectionIds, setEditCollectionIds] =
    useState<number[]>([])

  const [newTitle, setNewTitle] = useState('')
  const [newServings, setNewServings] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newIngredients, setNewIngredients] =
    useState('')
  const [newPreparation, setNewPreparation] =
    useState('')

  const [newCategoryIds, setNewCategoryIds] =
    useState<number[]>([])

  const [newCollectionIds, setNewCollectionIds] =
    useState<number[]>([])

  const [newRecipeMessage, setNewRecipeMessage] =
    useState('')

  const [newCategoryName, setNewCategoryName] =
    useState('')

  const [newCategoryIcon, setNewCategoryIcon] =
    useState<string | undefined>('🍽️')

  const [newCustomEmoji, setNewCustomEmoji] =
    useState('')

  const [editCategoryName, setEditCategoryName] =
    useState('')

  const [editCategoryIcon, setEditCategoryIcon] =
    useState<string | undefined>('🍽️')

  const [editCustomEmoji, setEditCustomEmoji] =
    useState('')

  const [newCollectionName, setNewCollectionName] =
    useState('')

  const [
    newCollectionDescription,
    setNewCollectionDescription,
  ] = useState('')

  const [editCollectionName, setEditCollectionName] =
    useState('')

  const [
    editCollectionDescription,
    setEditCollectionDescription,
  ] = useState('')

  const [importUrl, setImportUrl] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [importLoading, setImportLoading] =
    useState(false)

  const [recipePreview, setRecipePreview] =
    useState<ImportedRecipe | null>(null)

  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'existing' | 'error'
  >('idle')

  useEffect(() => {
    loadRecipes()
    loadCategories()
    loadCollections()
  }, [])

  async function loadRecipes() {
    const storedRecipes = await db.recipes
      .orderBy('title')
      .toArray()

    setRecipes(storedRecipes)
  }

  async function loadCategories() {
    const storedCategories = await db.categories
      .orderBy('sortOrder')
      .toArray()

    setCategories(storedCategories)
  }

  async function loadCollections() {
    const storedCollections = await db.collections
      .orderBy('sortOrder')
      .toArray()

    setCollections(storedCollections)
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

  function categoryDisplay(category: Category) {
    return category.icon
      ? `${category.icon} ${category.name}`
      : category.name
  }

  function categoryNameList(recipe: Recipe) {
    return categories
      .filter((category) =>
        (recipe.categoryIds ?? []).includes(
          category.id ?? -1,
        ),
      )
      .map(categoryDisplay)
  }

  function collectionNameList(recipe: Recipe) {
    return collections
      .filter((collection) =>
        (recipe.collectionIds ?? []).includes(
          collection.id ?? -1,
        ),
      )
      .map(
        (collection) =>
          `🗃️ ${collection.name}`,
      )
  }

  function recipeMatchesSearch(recipe: Recipe) {
    const query = searchQuery
      .trim()
      .toLowerCase()

    if (!query) return false

    const title =
      recipe.title?.toLowerCase() ?? ''

    const ingredients = (
      recipe.ingredients ?? []
    )
      .map((ingredient) => ingredient.name)
      .join(' ')
      .toLowerCase()

    const source =
      recipe.sourceName?.toLowerCase() ?? ''

    const categoryNames = categories
      .filter((category) =>
        (recipe.categoryIds ?? []).includes(
          category.id ?? -1,
        ),
      )
      .map((category) => category.name)
      .join(' ')
      .toLowerCase()

    const collectionNames = collections
      .filter((collection) =>
        (recipe.collectionIds ?? []).includes(
          collection.id ?? -1,
        ),
      )
      .map((collection) => collection.name)
      .join(' ')
      .toLowerCase()

    return (
      title.includes(query) ||
      ingredients.includes(query) ||
      source.includes(query) ||
      categoryNames.includes(query) ||
      collectionNames.includes(query)
    )
  }

  function startSearch() {
    if (!searchQuery.trim()) return

    setSelectedRecipe(null)
    setView('search')
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
        result.error ??
          'Das Rezept konnte nicht eingelesen werden.',
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

      if (
        existing &&
        existing.sourceUrl === sourceUrl
      ) {
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

        servingsLabel: Array.isArray(
          recipePreview.yield,
        )
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
      console.error(
        'Fehler beim Speichern:',
        error,
      )
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

    await db.recipes.update(
      selectedRecipe.id,
      {
        favorite: newValue,
        updatedAt,
      },
    )

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

    setEditServings(
      selectedRecipe.servingsLabel ?? '',
    )

    setEditTime(
      selectedRecipe.totalTimeMinutes
        ? String(
            selectedRecipe.totalTimeMinutes,
          )
        : '',
    )

    setEditIngredients(
      (selectedRecipe.ingredients ?? [])
        .map(
          (ingredient) =>
            ingredient.name,
        )
        .join('\n'),
    )

    setEditPreparation(
      (
        selectedRecipe.preparation ?? []
      ).join('\n'),
    )

    setEditCategoryIds(
      selectedRecipe.categoryIds ?? [],
    )

    setEditCollectionIds(
      selectedRecipe.collectionIds ?? [],
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

    const preparation =
      editPreparation
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    const parsedTime = Number(editTime)

    await db.recipes.update(
      selectedRecipe.id,
      {
        title:
          editTitle.trim() ||
          selectedRecipe.title,

        servingsLabel:
          editServings.trim() ||
          undefined,

        totalTimeMinutes:
          Number.isFinite(parsedTime) &&
          parsedTime > 0
            ? parsedTime
            : undefined,

        ingredients,
        preparation,

        categoryIds: editCategoryIds,
        collectionIds:
          editCollectionIds,

        updatedAt: new Date(),
      },
    )

    const updated =
      await db.recipes.get(
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
    setNewCategoryIds([])
    setNewCollectionIds([])
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

    const ingredients =
      newIngredients
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name, index) => ({
          id: `${Date.now()}-${index}`,
          name,
        }))

    const preparation =
      newPreparation
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    const parsedTime = Number(newTime)

    const now = new Date()

    const newId =
      await db.recipes.add({
        title,
        description: '',

        categoryIds: newCategoryIds,
        collectionIds:
          newCollectionIds,

        ingredients,
        preparation,

        servingsLabel:
          newServings.trim() ||
          undefined,

        totalTimeMinutes:
          Number.isFinite(parsedTime) &&
          parsedTime > 0
            ? parsedTime
            : undefined,

        imageIds: [],
        favorite: false,

        createdAt: now,
        updatedAt: now,
      })

    await loadRecipes()

    const createdRecipe =
      await db.recipes.get(newId)

    setShowNewRecipe(false)
    setView('recipes')

    if (createdRecipe) {
      setSelectedRecipe(createdRecipe)
    }
  }

  function toggleNewCategory(
    categoryId: number,
  ) {
    setNewCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(
            (id) => id !== categoryId,
          )
        : [...current, categoryId],
    )
  }

  function toggleEditCategory(
    categoryId: number,
  ) {
    setEditCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(
            (id) => id !== categoryId,
          )
        : [...current, categoryId],
    )
  }

  function toggleNewCollection(
    collectionId: number,
  ) {
    setNewCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter(
            (id) => id !== collectionId,
          )
        : [...current, collectionId],
    )
  }

  function toggleEditCollection(
    collectionId: number,
  ) {
    setEditCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter(
            (id) => id !== collectionId,
          )
        : [...current, collectionId],
    )
  }

  function openNewCategory() {
    setNewCategoryName('')
    setNewCategoryIcon('🍽️')
    setNewCustomEmoji('')

    setShowNewCategory(true)
  }

  async function saveNewCategory() {
    const name = newCategoryName.trim()

    if (!name) {
      window.alert(
        'Bitte einen Kategorienamen eingeben.',
      )
      return
    }

    const existing =
      await db.categories
        .where('name')
        .equals(name)
        .first()

    if (existing) {
      window.alert(
        'Diese Kategorie gibt es bereits.',
      )
      return
    }

    await db.categories.add({
      name,
      icon: newCategoryIcon,
      sortOrder: categories.length,
    })

    setShowNewCategory(false)

    await loadCategories()
  }

  function openCategory(
    category: Category,
  ) {
    setSelectedCategory(category)
    setView('categoryRecipes')
  }

  function openCategoryEdit(
    category: Category,
  ) {
    setSelectedCategory(category)

    setEditCategoryName(
      category.name,
    )

    setEditCategoryIcon(
      category.icon,
    )

    setEditCustomEmoji('')

    setShowEditCategory(true)
  }

  async function saveCategoryEdit() {
    if (!selectedCategory?.id) return

    const name =
      editCategoryName.trim()

    if (!name) {
      window.alert(
        'Bitte einen Kategorienamen eingeben.',
      )
      return
    }

    await db.categories.update(
      selectedCategory.id,
      {
        name,
        icon: editCategoryIcon,
      },
    )

    setSelectedCategory({
      ...selectedCategory,
      name,
      icon: editCategoryIcon,
    })

    setShowEditCategory(false)

    await loadCategories()
  }

  async function deleteCategory(
    category: Category,
  ) {
    if (!category.id) return

    const confirmed =
      window.confirm(
        `Möchtest du die Kategorie "${category.name}" wirklich löschen?\n\nDie Rezepte selbst bleiben erhalten.`,
      )

    if (!confirmed) return

    const affectedRecipes =
      recipes.filter((recipe) =>
        (
          recipe.categoryIds ?? []
        ).includes(category.id!),
      )

    for (const recipe of affectedRecipes) {
      if (!recipe.id) continue

      await db.recipes.update(
        recipe.id,
        {
          categoryIds: (
            recipe.categoryIds ?? []
          ).filter(
            (id) =>
              id !== category.id,
          ),

          updatedAt: new Date(),
        },
      )
    }

    await db.categories.delete(
      category.id,
    )

    if (
      selectedCategory?.id ===
      category.id
    ) {
      setSelectedCategory(null)
      setView('categories')
    }

    await loadRecipes()
    await loadCategories()
  }

  function openNewCollection() {
    setNewCollectionName('')
    setNewCollectionDescription('')

    setShowNewCollection(true)
  }

  async function saveNewCollection() {
    const name =
      newCollectionName.trim()

    if (!name) {
      window.alert(
        'Bitte einen Namen für die Sammlung eingeben.',
      )
      return
    }

    const existing =
      await db.collections
        .where('name')
        .equals(name)
        .first()

    if (existing) {
      window.alert(
        'Diese Sammlung gibt es bereits.',
      )
      return
    }

    await db.collections.add({
      name,

      description:
        newCollectionDescription.trim() ||
        undefined,

      sortOrder: collections.length,
    })

    setShowNewCollection(false)

    await loadCollections()
  }

  function openCollection(
    collection: Collection,
  ) {
    setSelectedCollection(collection)
    setView('collectionRecipes')
  }

  function openCollectionEdit(
    collection: Collection,
  ) {
    setSelectedCollection(collection)

    setEditCollectionName(
      collection.name,
    )

    setEditCollectionDescription(
      collection.description ?? '',
    )

    setShowEditCollection(true)
  }

  async function saveCollectionEdit() {
    if (!selectedCollection?.id) return

    const name =
      editCollectionName.trim()

    if (!name) {
      window.alert(
        'Bitte einen Namen für die Sammlung eingeben.',
      )
      return
    }

    await db.collections.update(
      selectedCollection.id,
      {
        name,

        description:
          editCollectionDescription.trim() ||
          undefined,
      },
    )

    setSelectedCollection({
      ...selectedCollection,
      name,

      description:
        editCollectionDescription.trim() ||
        undefined,
    })

    setShowEditCollection(false)

    await loadCollections()
  }

  async function deleteCollection(
    collection: Collection,
  ) {
    if (!collection.id) return

    const confirmed =
      window.confirm(
        `Möchtest du die Sammlung "${collection.name}" wirklich löschen?\n\nDie Rezepte selbst bleiben erhalten.`,
      )

    if (!confirmed) return

    const affectedRecipes =
      recipes.filter((recipe) =>
        (
          recipe.collectionIds ?? []
        ).includes(collection.id!),
      )

    for (const recipe of affectedRecipes) {
      if (!recipe.id) continue

      await db.recipes.update(
        recipe.id,
        {
          collectionIds: (
            recipe.collectionIds ?? []
          ).filter(
            (id) =>
              id !== collection.id,
          ),

          updatedAt: new Date(),
        },
      )
    }

    await db.collections.delete(
      collection.id,
    )

    if (
      selectedCollection?.id ===
      collection.id
    ) {
      setSelectedCollection(null)
      setView('collections')
    }

    await loadRecipes()
    await loadCollections()
  }

  function renderCategoryChoices(
    selectedIds: number[],
    toggle: (id: number) => void,
  ) {
    if (categories.length === 0) {
      return (
        <p>
          Noch keine Kategorien vorhanden.
        </p>
      )
    }

    return (
      <div>
        {categories.map((category) => {
          if (!category.id) return null

          return (
            <label
              key={category.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '10px',
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(
                  category.id,
                )}
                onChange={() =>
                  toggle(category.id!)
                }
                style={{
                  width: 'auto',
                  margin: 0,
                }}
              />

              <span>
                {categoryDisplay(
                  category,
                )}
              </span>
            </label>
          )
        })}
      </div>
    )
  }

  function renderCollectionChoices(
    selectedIds: number[],
    toggle: (id: number) => void,
  ) {
    if (collections.length === 0) {
      return (
        <p>
          Noch keine Sammlungen vorhanden.
        </p>
      )
    }

    return (
      <div>
        {collections.map((collection) => {
          if (!collection.id) return null

          return (
            <label
              key={collection.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '10px',
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(
                  collection.id,
                )}
                onChange={() =>
                  toggle(collection.id!)
                }
                style={{
                  width: 'auto',
                  margin: 0,
                }}
              />

              <span>
                🗃️ {collection.name}
              </span>
            </label>
          )
        })}
      </div>
    )
  }

  function renderIconPicker(
    selectedIcon: string | undefined,
    onSelect: (
      icon: string | undefined,
    ) => void,
    customEmoji: string,
    setCustomEmoji: (
      value: string,
    ) => void,
  ) {
    return (
      <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(52px, 1fr))',
            gap: '10px',
            marginTop: '10px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              onSelect(undefined)
              setCustomEmoji('')
            }}
            title="Kein Symbol"
            style={{
              height: '52px',
              borderRadius: '13px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,

              border:
                selectedIcon === undefined
                  ? '3px solid #ef7658'
                  : '1px solid #e4dbd1',

              background:
                selectedIcon === undefined
                  ? '#fff1ec'
                  : '#fbfaf8',
            }}
          >
            Ohne
          </button>

          {CATEGORY_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onSelect(icon)
                setCustomEmoji('')
              }}
              style={{
                height: '52px',
                borderRadius: '13px',
                cursor: 'pointer',
                fontSize: '1.65rem',

                border:
                  selectedIcon === icon
                    ? '3px solid #ef7658'
                    : '1px solid #e4dbd1',

                background:
                  selectedIcon === icon
                    ? '#fff1ec'
                    : '#fbfaf8',
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        <label>
          Eigenes Emoji
          <input
            value={customEmoji}
            onChange={(event) => {
              const value =
                event.target.value

              setCustomEmoji(value)

              if (value.trim()) {
                onSelect(value.trim())
              }
            }}
            placeholder="z. B. 🥣"
            maxLength={8}
          />
        </label>
      </>
    )
  }

  function renderRecipeGrid(
    list: Recipe[],
  ) {
    if (list.length === 0) {
      return (
        <div className="empty-recipes">
          {view === 'favorites'
            ? 'Du hast noch keine Favoriten markiert.'
            : view ===
                'categoryRecipes'
              ? 'In dieser Kategorie sind noch keine Rezepte.'
              : view ===
                  'collectionRecipes'
                ? 'In dieser Sammlung sind noch keine Rezepte.'
                : view === 'search'
                  ? `Keine Rezepte für „${searchQuery}“ gefunden.`
                  : 'Noch keine Rezepte gespeichert.'}
        </div>
      )
    }

    return (
      <div className="recipe-grid">
        {list.map((recipe) => {
          const recipeCategories =
            categoryNameList(recipe)

          const recipeCollections =
            collectionNameList(recipe)

          return (
            <button
              type="button"
              className="recipe-card recipe-card-button"
              key={recipe.id}
              onClick={() =>
                setSelectedRecipe(recipe)
              }
            >
              {recipe.sourceImageUrl ? (
                <img
                  src={
                    recipe.sourceImageUrl
                  }
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
                  <h3>
                    {recipe.title}
                  </h3>

                  {recipe.favorite && (
                    <span className="favorite-mark">
                      ❤️
                    </span>
                  )}
                </div>

                {recipe.servingsLabel && (
                  <p>
                    👥{' '}
                    {
                      recipe.servingsLabel
                    }
                  </p>
                )}

                {recipe.totalTimeMinutes && (
                  <p>
                    ⏱️{' '}
                    {
                      recipe.totalTimeMinutes
                    }{' '}
                    Min.
                  </p>
                )}

                {recipeCategories.length >
                  0 && (
                  <p>
                    {recipeCategories.join(
                      ' · ',
                    )}
                  </p>
                )}

                {recipeCollections.length >
                  0 && (
                  <p>
                    {recipeCollections.join(
                      ' · ',
                    )}
                  </p>
                )}

                {recipe.sourceName && (
                  <p className="recipe-source">
                    Quelle:{' '}
                    {
                      recipe.sourceName
                    }
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const favoriteRecipes =
    recipes.filter(
      (recipe) => recipe.favorite,
    )

  const categoryRecipes =
    selectedCategory?.id
      ? recipes.filter((recipe) =>
          (
            recipe.categoryIds ?? []
          ).includes(
            selectedCategory.id!,
          ),
        )
      : []

  const collectionRecipes =
    selectedCollection?.id
      ? recipes.filter((recipe) =>
          (
            recipe.collectionIds ?? []
          ).includes(
            selectedCollection.id!,
          ),
        )
      : []

  const searchResults =
    recipes.filter(recipeMatchesSearch)

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
                onClick={() =>
                  setSelectedRecipe(null)
                }
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
                src={
                  selectedRecipe.sourceImageUrl
                }
                alt={
                  selectedRecipe.title
                }
                className="recipe-detail-image"
              />
            )}

            <h2>
              {selectedRecipe.title}
            </h2>

            <div className="recipe-detail-meta">
              {selectedRecipe.servingsLabel && (
                <span>
                  👥{' '}
                  {
                    selectedRecipe.servingsLabel
                  }
                </span>
              )}

              {selectedRecipe.totalTimeMinutes && (
                <span>
                  ⏱️{' '}
                  {
                    selectedRecipe.totalTimeMinutes
                  }{' '}
                  Min.
                </span>
              )}
            </div>

            {categoryNameList(
              selectedRecipe,
            ).length > 0 && (
              <div className="recipe-detail-meta">
                {categoryNameList(
                  selectedRecipe,
                ).map((name) => (
                  <span key={name}>
                    {name}
                  </span>
                ))}
              </div>
            )}

            {collectionNameList(
              selectedRecipe,
            ).length > 0 && (
              <div className="recipe-detail-meta">
                {collectionNameList(
                  selectedRecipe,
                ).map((name) => (
                  <span key={name}>
                    {name}
                  </span>
                ))}
              </div>
            )}

            <div className="recipe-detail-section">
              <h3>Zutaten</h3>

              {(
                selectedRecipe.ingredients ??
                []
              ).length > 0 ? (
                <ul>
                  {(
                    selectedRecipe.ingredients ??
                    []
                  ).map(
                    (ingredient) => (
                      <li
                        key={
                          ingredient.id
                        }
                      >
                        {
                          ingredient.name
                        }
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>
                  Keine Zutaten gespeichert.
                </p>
              )}
            </div>

            <div className="recipe-detail-section">
              <h3>Zubereitung</h3>

              {(
                selectedRecipe.preparation ??
                []
              ).length > 0 ? (
                <ol>
                  {(
                    selectedRecipe.preparation ??
                    []
                  ).map(
                    (step, index) => (
                      <li key={index}>
                        {step}
                      </li>
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
                  href={
                    selectedRecipe.sourceUrl
                  }
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
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter'
                  ) {
                    startSearch()
                  }
                }}
                placeholder="Rezepte und Zutaten durchsuchen …"
              />

              <button
                className="primary"
                type="button"
                onClick={startSearch}
                disabled={
                  !searchQuery.trim()
                }
                style={{
                  width: '100%',
                  marginTop: '14px',
                }}
              >
                🔎 Suchen
              </button>
            </section>

            <section className="quick-actions">
              <button
                className="card"
                type="button"
                onClick={() =>
                  setView('recipes')
                }
              >
                <span className="icon">
                  📖
                </span>
                <strong>
                  Rezepte
                </strong>
                <span>
                  Alle Rezepte ansehen
                </span>
              </button>

              <button
                className="card"
                type="button"
                onClick={() =>
                  setView('categories')
                }
              >
                <span className="icon">
                  🗂️
                </span>

                <strong>
                  Kategorien
                </strong>

                <span>
                  {categories.length ===
                  0
                    ? 'Rezepte nach Kategorien'
                    : `${categories.length} ${
                        categories.length ===
                        1
                          ? 'Kategorie'
                          : 'Kategorien'
                      }`}
                </span>
              </button>

              <button
                className="card"
                type="button"
                onClick={() =>
                  setView('collections')
                }
              >
                <span className="icon">
                  🗃️
                </span>

                <strong>
                  Sammlungen
                </strong>

                <span>
                  {collections.length ===
                  0
                    ? 'Eigene Rezeptsammlungen'
                    : `${collections.length} ${
                        collections.length ===
                        1
                          ? 'Sammlung'
                          : 'Sammlungen'
                      }`}
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

                <strong>
                  Favoriten
                </strong>

                <span>
                  {favoriteRecipes.length ===
                  0
                    ? 'Deine Lieblingsrezepte'
                    : `${favoriteRecipes.length} ${
                        favoriteRecipes.length ===
                        1
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
        ) : view === 'search' ? (
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
                  Suchergebnisse
                </h2>

                <p>
                  {searchResults.length}{' '}
                  {searchResults.length ===
                  1
                    ? 'Treffer'
                    : 'Treffer'}{' '}
                  für „{searchQuery}“
                </p>
              </div>
            </div>

            <section
              className="welcome"
              style={{
                marginBottom: '26px',
              }}
            >
              <input
                className="search"
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter'
                  ) {
                    startSearch()
                  }
                }}
                placeholder="Neue Suche …"
              />

              <button
                className="primary"
                type="button"
                onClick={startSearch}
                disabled={
                  !searchQuery.trim()
                }
                style={{
                  width: '100%',
                  marginTop: '14px',
                }}
              >
                🔎 Suchen
              </button>
            </section>

            {renderRecipeGrid(
              searchResults,
            )}
          </section>
        ) : view ===
          'categories' ? (
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
                  Kategorien
                </h2>

                <p>
                  {categories.length}{' '}
                  {categories.length ===
                  1
                    ? 'Kategorie'
                    : 'Kategorien'}
                </p>
              </div>
            </div>

            <button
              className="primary"
              type="button"
              onClick={
                openNewCategory
              }
              style={{
                width: '100%',
                marginBottom: '24px',
              }}
            >
              ＋ Neue Kategorie
            </button>

            {categories.length ===
            0 ? (
              <div className="empty-recipes">
                Noch keine Kategorien
                vorhanden.
              </div>
            ) : (
              <div className="recipe-grid">
                {categories.map(
                  (category) => {
                    const count =
                      category.id
                        ? recipes.filter(
                            (recipe) =>
                              (
                                recipe.categoryIds ??
                                []
                              ).includes(
                                category.id!,
                              ),
                          ).length
                        : 0

                    return (
                      <article
                        className="recipe-card"
                        key={
                          category.id
                        }
                      >
                        <button
                          type="button"
                          className="recipe-card-button"
                          onClick={() =>
                            openCategory(
                              category,
                            )
                          }
                        >
                          <div className="recipe-card-placeholder">
                            {category.icon ||
                              '—'}
                          </div>

                          <div className="recipe-card-content">
                            <h3>
                              {
                                category.name
                              }
                            </h3>

                            <p>
                              {count}{' '}
                              {count === 1
                                ? 'Rezept'
                                : 'Rezepte'}
                            </p>
                          </div>
                        </button>

                        <div
                          style={{
                            display:
                              'flex',
                            gap: '8px',
                            padding:
                              '0 20px 20px',
                          }}
                        >
                          <button
                            className="edit-button"
                            type="button"
                            style={{
                              flex: 1,
                            }}
                            onClick={() =>
                              openCategoryEdit(
                                category,
                              )
                            }
                          >
                            ✏️ Bearbeiten
                          </button>

                          <button
                            className="delete-button"
                            type="button"
                            style={{
                              flex: 1,
                            }}
                            onClick={() =>
                              deleteCategory(
                                category,
                              )
                            }
                          >
                            🗑️ Löschen
                          </button>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        ) : view ===
          'collections' ? (
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
                  Sammlungen
                </h2>

                <p>
                  {collections.length}{' '}
                  {collections.length ===
                  1
                    ? 'Sammlung'
                    : 'Sammlungen'}
                </p>
              </div>
            </div>

            <button
              className="primary"
              type="button"
              onClick={
                openNewCollection
              }
              style={{
                width: '100%',
                marginBottom: '24px',
              }}
            >
              ＋ Neue Sammlung
            </button>

            {collections.length ===
            0 ? (
              <div className="empty-recipes">
                Noch keine Sammlungen
                vorhanden.
              </div>
            ) : (
              <div className="recipe-grid">
                {collections.map(
                  (collection) => {
                    const count =
                      collection.id
                        ? recipes.filter(
                            (recipe) =>
                              (
                                recipe.collectionIds ??
                                []
                              ).includes(
                                collection.id!,
                              ),
                          ).length
                        : 0

                    return (
                      <article
                        className="recipe-card"
                        key={
                          collection.id
                        }
                      >
                        <button
                          type="button"
                          className="recipe-card-button"
                          onClick={() =>
                            openCollection(
                              collection,
                            )
                          }
                        >
                          <div className="recipe-card-placeholder">
                            🗃️
                          </div>

                          <div className="recipe-card-content">
                            <h3>
                              {
                                collection.name
                              }
                            </h3>

                            {collection.description && (
                              <p>
                                {
                                  collection.description
                                }
                              </p>
                            )}

                            <p>
                              {count}{' '}
                              {count === 1
                                ? 'Rezept'
                                : 'Rezepte'}
                            </p>
                          </div>
                        </button>

                        <div
                          style={{
                            display:
                              'flex',
                            gap: '8px',
                            padding:
                              '0 20px 20px',
                          }}
                        >
                          <button
                            className="edit-button"
                            type="button"
                            style={{
                              flex: 1,
                            }}
                            onClick={() =>
                              openCollectionEdit(
                                collection,
                              )
                            }
                          >
                            ✏️ Bearbeiten
                          </button>

                          <button
                            className="delete-button"
                            type="button"
                            style={{
                              flex: 1,
                            }}
                            onClick={() =>
                              deleteCollection(
                                collection,
                              )
                            }
                          >
                            🗑️ Löschen
                          </button>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        ) : view ===
          'categoryRecipes' ? (
          <section className="recipes-view">
            <div className="recipes-header">
              <button
                className="back-button"
                type="button"
                onClick={() =>
                  setView(
                    'categories',
                  )
                }
              >
                ← Kategorien
              </button>

              <div>
                <h2>
                  {selectedCategory
                    ? categoryDisplay(
                        selectedCategory,
                      )
                    : 'Kategorie'}
                </h2>

                <p>
                  {
                    categoryRecipes.length
                  }{' '}
                  {categoryRecipes.length ===
                  1
                    ? 'Rezept'
                    : 'Rezepte'}
                </p>
              </div>
            </div>

            {renderRecipeGrid(
              categoryRecipes,
            )}
          </section>
        ) : view ===
          'collectionRecipes' ? (
          <section className="recipes-view">
            <div className="recipes-header">
              <button
                className="back-button"
                type="button"
                onClick={() =>
                  setView(
                    'collections',
                  )
                }
              >
                ← Sammlungen
              </button>

              <div>
                <h2>
                  🗃️{' '}
                  {selectedCollection?.name ??
                    'Sammlung'}
                </h2>

                {selectedCollection?.description && (
                  <p>
                    {
                      selectedCollection.description
                    }
                  </p>
                )}

                <p>
                  {
                    collectionRecipes.length
                  }{' '}
                  {collectionRecipes.length ===
                  1
                    ? 'Rezept'
                    : 'Rezepte'}
                </p>
              </div>
            </div>

            {renderRecipeGrid(
              collectionRecipes,
            )}
          </section>
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
                  {view ===
                  'favorites'
                    ? 'Meine Favoriten'
                    : 'Meine Rezepte'}
                </h2>

                <p>
                  {view ===
                  'favorites'
                    ? favoriteRecipes.length
                    : recipes.length}{' '}
                  {(view ===
                    'favorites'
                    ? favoriteRecipes.length
                    : recipes.length) ===
                  1
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

            <h2>
              Rezept importieren
            </h2>

            <p>
              Füge den Link zu einer
              Rezept-Webseite ein.
            </p>

            <input
              className="import-input"
              type="url"
              value={importUrl}
              onChange={(event) => {
                setImportUrl(
                  event.target.value,
                )
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
                    src={
                      recipePreview.image
                    }
                    alt={
                      recipePreview.title
                    }
                    className="preview-image"
                  />
                )}

                <h3>
                  {
                    recipePreview.title
                  }
                </h3>

                <h4>Zutaten</h4>

                <ul>
                  {recipePreview.ingredients.map(
                    (
                      ingredient,
                      index,
                    ) => (
                      <li key={index}>
                        {
                          ingredient
                        }
                      </li>
                    ),
                  )}
                </ul>

                <h4>
                  Zubereitung
                </h4>

                <ol>
                  {recipePreview.instructions.map(
                    (
                      instruction,
                      index,
                    ) => (
                      <li key={index}>
                        {
                          instruction
                        }
                      </li>
                    ),
                  )}
                </ol>

                <button
                  className="save-recipe-button"
                  type="button"
                  disabled={
                    saveStatus ===
                      'saving' ||
                    saveStatus ===
                      'saved' ||
                    saveStatus ===
                      'existing'
                  }
                  onClick={
                    saveImportedRecipe
                  }
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
                setShowNewRecipe(
                  false,
                )
              }
            >
              ×
            </button>

            <h2>
              Neues Rezept
            </h2>

            <label>
              Rezeptname
              <input
                value={newTitle}
                onChange={(event) => {
                  setNewTitle(
                    event.target.value,
                  )
                  setNewRecipeMessage(
                    '',
                  )
                }}
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
              />
            </label>

            <label>
              Kategorien
              {renderCategoryChoices(
                newCategoryIds,
                toggleNewCategory,
              )}
            </label>

            <label>
              Sammlungen
              {renderCollectionChoices(
                newCollectionIds,
                toggleNewCollection,
              )}
            </label>

            <label>
              Zutaten – eine Zeile
              pro Zutat
              <textarea
                value={
                  newIngredients
                }
                onChange={(event) =>
                  setNewIngredients(
                    event.target.value,
                  )
                }
                rows={10}
              />
            </label>

            <label>
              Zubereitung – ein
              Schritt pro Zeile
              <textarea
                value={
                  newPreparation
                }
                onChange={(event) =>
                  setNewPreparation(
                    event.target.value,
                  )
                }
                rows={10}
              />
            </label>

            {newRecipeMessage && (
              <p className="import-message">
                {
                  newRecipeMessage
                }
              </p>
            )}

            <button
              className="save-recipe-button"
              type="button"
              onClick={
                saveNewRecipe
              }
            >
              Rezept speichern
            </button>
          </div>
        </div>
      )}

      {showEdit &&
        selectedRecipe && (
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

              <h2>
                Rezept bearbeiten
              </h2>

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
                  value={
                    editServings
                  }
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
                Kategorien
                {renderCategoryChoices(
                  editCategoryIds,
                  toggleEditCategory,
                )}
              </label>

              <label>
                Sammlungen
                {renderCollectionChoices(
                  editCollectionIds,
                  toggleEditCollection,
                )}
              </label>

              <label>
                Zutaten – eine Zeile
                pro Zutat
                <textarea
                  value={
                    editIngredients
                  }
                  onChange={(event) =>
                    setEditIngredients(
                      event.target.value,
                    )
                  }
                  rows={10}
                />
              </label>

              <label>
                Zubereitung – ein
                Schritt pro Zeile
                <textarea
                  value={
                    editPreparation
                  }
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

      {showNewCategory && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewCategory(
              false,
            )
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
                setShowNewCategory(
                  false,
                )
              }
            >
              ×
            </button>

            <h2>
              Neue Kategorie
            </h2>

            <label>
              Symbol auswählen
            </label>

            {renderIconPicker(
              newCategoryIcon,
              setNewCategoryIcon,
              newCustomEmoji,
              setNewCustomEmoji,
            )}

            <div
              style={{
                textAlign: 'center',
                fontSize:
                  newCategoryIcon
                    ? '3rem'
                    : '1rem',
                margin:
                  '8px 0 18px',
              }}
            >
              {newCategoryIcon ||
                'Kein Symbol'}
            </div>

            <label>
              Kategoriename
              <input
                value={
                  newCategoryName
                }
                onChange={(event) =>
                  setNewCategoryName(
                    event.target.value,
                  )
                }
              />
            </label>

            <button
              className="save-recipe-button"
              type="button"
              onClick={
                saveNewCategory
              }
            >
              Kategorie speichern
            </button>
          </div>
        </div>
      )}

      {showEditCategory &&
        selectedCategory && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowEditCategory(
                false,
              )
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
                  setShowEditCategory(
                    false,
                  )
                }
              >
                ×
              </button>

              <h2>
                Kategorie bearbeiten
              </h2>

              <label>
                Symbol auswählen
              </label>

              {renderIconPicker(
                editCategoryIcon,
                setEditCategoryIcon,
                editCustomEmoji,
                setEditCustomEmoji,
              )}

              <div
                style={{
                  textAlign:
                    'center',
                  fontSize:
                    editCategoryIcon
                      ? '3rem'
                      : '1rem',
                  margin:
                    '8px 0 18px',
                }}
              >
                {editCategoryIcon ||
                  'Kein Symbol'}
              </div>

              <label>
                Kategoriename
                <input
                  value={
                    editCategoryName
                  }
                  onChange={(event) =>
                    setEditCategoryName(
                      event.target.value,
                    )
                  }
                />
              </label>

              <button
                className="save-recipe-button"
                type="button"
                onClick={
                  saveCategoryEdit
                }
              >
                Änderungen speichern
              </button>
            </div>
          </div>
        )}

      {showNewCollection && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewCollection(
              false,
            )
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
                setShowNewCollection(
                  false,
                )
              }
            >
              ×
            </button>

            <h2>
              Neue Sammlung
            </h2>

            <label>
              Name der Sammlung
              <input
                value={
                  newCollectionName
                }
                onChange={(event) =>
                  setNewCollectionName(
                    event.target.value,
                  )
                }
                placeholder="z. B. Weihnachten"
              />
            </label>

            <label>
              Beschreibung
              <textarea
                value={
                  newCollectionDescription
                }
                onChange={(event) =>
                  setNewCollectionDescription(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Optional"
              />
            </label>

            <button
              className="save-recipe-button"
              type="button"
              onClick={
                saveNewCollection
              }
            >
              Sammlung speichern
            </button>
          </div>
        </div>
      )}

      {showEditCollection &&
        selectedCollection && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowEditCollection(
                false,
              )
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
                  setShowEditCollection(
                    false,
                  )
                }
              >
                ×
              </button>

              <h2>
                Sammlung bearbeiten
              </h2>

              <label>
                Name der Sammlung
                <input
                  value={
                    editCollectionName
                  }
                  onChange={(event) =>
                    setEditCollectionName(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Beschreibung
                <textarea
                  value={
                    editCollectionDescription
                  }
                  onChange={(event) =>
                    setEditCollectionDescription(
                      event.target.value,
                    )
                  }
                  rows={4}
                />
              </label>

              <button
                className="save-recipe-button"
                type="button"
                onClick={
                  saveCollectionEdit
                }
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