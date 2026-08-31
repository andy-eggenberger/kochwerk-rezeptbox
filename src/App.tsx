import {
  useEffect,
  useState,
  type ChangeEvent,
} from 'react'

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

type BackupData = {
  app: 'Kochwerk'
  backupVersion: 1
  createdAt: string
  recipes: Recipe[]
  categories: Category[]
  collections: Collection[]
}

const APP_VERSION = '0.7.0'

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
  const [showBackup, setShowBackup] = useState(false)
  const [showNasSync, setShowNasSync] = useState(false)

  const [nasUrl, setNasUrl] = useState(
    'https://andys-rezeptbox.synology.me/kochwerk.php',
  )
  const [nasKey, setNasKey] = useState('')
  const [nasMessage, setNasMessage] = useState('')
  const [nasTesting, setNasTesting] = useState(false)
  const [nasUploading, setNasUploading] = useState(false)
  const [nasDataExists, setNasDataExists] = useState(false)
  const [nasRevision, setNasRevision] =
    useState<string | null>(null)
  const [nasPullChecking, setNasPullChecking] = useState(false)
  const [nasPreview, setNasPreview] = useState<{
    recipeCount: number
    categoryCount: number
    collectionCount: number
    updatedAt: string | null
  } | null>(null)
  const [nasPulledData, setNasPulledData] =
    useState<BackupData | null>(null)
  const [nasApplying, setNasApplying] = useState(false)

  const [nasSyncStatus, setNasSyncStatus] = useState<
    'off' | 'syncing' | 'synced' | 'conflict' | 'error'
  >('off')
  const [nasLastSyncAt, setNasLastSyncAt] =
    useState<string | null>(null)

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

  const [searchCategoryId, setSearchCategoryId] =
    useState<number | 'all'>('all')

  const [searchCollectionId, setSearchCollectionId] =
    useState<number | 'all'>('all')

  const [searchFavoritesOnly, setSearchFavoritesOnly] =
    useState(false)

  const [searchSort, setSearchSort] = useState<
    'az' | 'updated'
  >('az')

  const [backupMessage, setBackupMessage] =
    useState('')

  const [backupRestoreMode, setBackupRestoreMode] =
    useState<'merge' | 'replace'>('merge')

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

  const [editNotes, setEditNotes] = useState('')
  const [editSourceUrl, setEditSourceUrl] = useState('')
  const [editSourceName, setEditSourceName] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editFavorite, setEditFavorite] = useState(false)

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

  const [importMode, setImportMode] =
    useState<'link' | 'facebookText'>('link')

  const [facebookText, setFacebookText] =
    useState('')

  const [importNotes, setImportNotes] =
    useState('')

  const [importImageUrl, setImportImageUrl] =
    useState('')

  const [importLoading, setImportLoading] =
    useState(false)

  const [recipePreview, setRecipePreview] =
    useState<ImportedRecipe | null>(null)

  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')

  const [importCategoryIds, setImportCategoryIds] =
    useState<number[]>([])

  const [importCollectionIds, setImportCollectionIds] =
    useState<number[]>([])

  const [importFavorite, setImportFavorite] =
    useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'existing' | 'error'
  >('idle')

  useEffect(() => {
    void (async () => {
      await loadAllData()

      const storedNasUrl =
        window.localStorage.getItem(
          'kochwerkNasUrl',
        )

      const storedNasKey =
        window.localStorage.getItem(
          'kochwerkNasKey',
        )

      if (storedNasUrl) {
        setNasUrl(storedNasUrl)
      }

      if (storedNasKey) {
        setNasKey(storedNasKey)
      }

      const storedLastSyncAt =
        window.localStorage.getItem(
          'kochwerkNasLastSyncAt',
        )

      if (storedLastSyncAt) {
        setNasLastSyncAt(
          storedLastSyncAt,
        )
      }

      if (
        storedNasUrl &&
        storedNasKey
      ) {
        await autoSyncWithNas(
          storedNasUrl,
          storedNasKey,
          true,
        )
      }

      const currentUrl =
        new URL(
          window.location.href,
        )

      const sharedImportUrl =
        currentUrl.searchParams.get(
          'import',
        )

      if (sharedImportUrl) {
        setImportUrl(
          sharedImportUrl,
        )
        setImportMessage(
          'Link aus dem Teilen-Menü übernommen.',
        )
        setRecipePreview(null)
        setImportCategoryIds([])
        setImportCollectionIds([])
        setImportFavorite(false)
        setSaveStatus('idle')
        setShowImport(true)

        currentUrl.searchParams.delete(
          'import',
        )

        window.history.replaceState(
          {},
          '',
          `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
        )
      }
    })()

    const runStoredNasSync =
      () => {
        const storedUrl =
          window.localStorage.getItem(
            'kochwerkNasUrl',
          )
        const storedKey =
          window.localStorage.getItem(
            'kochwerkNasKey',
          )

        if (
          storedUrl &&
          storedKey
        ) {
          void autoSyncWithNas(
            storedUrl,
            storedKey,
            false,
          )
        }
      }

    const intervalId =
      window.setInterval(
        runStoredNasSync,
        60000,
      )

    const handleFocus =
      () => runStoredNasSync()

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          runStoredNasSync()
        }
      }

    window.addEventListener(
      'focus',
      handleFocus,
    )
    document.addEventListener(
      'visibilitychange',
      handleVisibility,
    )

    return () => {
      window.clearInterval(
        intervalId,
      )
      window.removeEventListener(
        'focus',
        handleFocus,
      )
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      )
    }
  }, [])

  async function loadAllData() {
    await Promise.all([
      loadRecipes(),
      loadCategories(),
      loadCollections(),
    ])
  }

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

    const title =
      recipe.title?.toLowerCase() ?? ''

    const ingredients = (
      recipe.ingredients ?? []
    )
      .map((ingredient) => ingredient.name)
      .join(' ')
      .toLowerCase()

    const preparation = (
      recipe.preparation ?? []
    )
      .join(' ')
      .toLowerCase()

    const notes =
      recipe.description?.toLowerCase() ?? ''

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

    const matchesText =
      !query ||
      title.includes(query) ||
      ingredients.includes(query) ||
      preparation.includes(query) ||
      notes.includes(query) ||
      source.includes(query) ||
      categoryNames.includes(query) ||
      collectionNames.includes(query)

    const matchesCategory =
      searchCategoryId === 'all' ||
      (recipe.categoryIds ?? []).includes(
        searchCategoryId,
      )

    const matchesCollection =
      searchCollectionId === 'all' ||
      (recipe.collectionIds ?? []).includes(
        searchCollectionId,
      )

    const matchesFavorite =
      !searchFavoritesOnly ||
      Boolean(recipe.favorite)

    return (
      matchesText &&
      matchesCategory &&
      matchesCollection &&
      matchesFavorite
    )
  }

  function startSearch() {
    if (
      !searchQuery.trim() &&
      searchCategoryId === 'all' &&
      searchCollectionId === 'all' &&
      !searchFavoritesOnly
    ) {
      return
    }

    setSelectedRecipe(null)
    setView('search')
  }

  function resetSearchFilters() {
    setSearchQuery('')
    setSearchCategoryId('all')
    setSearchCollectionId('all')
    setSearchFavoritesOnly(false)
    setSearchSort('az')
  }

  async function readLocalSnapshot(): Promise<BackupData> {
    const [
      localRecipes,
      localCategories,
      localCollections,
    ] = await Promise.all([
      db.recipes.toArray(),
      db.categories.toArray(),
      db.collections.toArray(),
    ])

    return {
      app: 'Kochwerk',
      backupVersion: 1,
      createdAt:
        new Date().toISOString(),
      recipes: localRecipes,
      categories: localCategories,
      collections: localCollections,
    }
  }

  function canonicalSnapshot(
    data: BackupData,
  ) {
    const recipesSorted =
      [...data.recipes].sort(
        (a, b) =>
          Number(a.id ?? 0) -
          Number(b.id ?? 0),
      )

    const categoriesSorted =
      [...data.categories].sort(
        (a, b) =>
          Number(a.id ?? 0) -
          Number(b.id ?? 0),
      )

    const collectionsSorted =
      [...data.collections].sort(
        (a, b) =>
          Number(a.id ?? 0) -
          Number(b.id ?? 0),
      )

    return JSON.stringify({
      app: 'Kochwerk',
      backupVersion: 1,
      recipes: recipesSorted,
      categories: categoriesSorted,
      collections: collectionsSorted,
    })
  }

  async function hashSnapshot(
    data: BackupData,
  ) {
    const encoded =
      new TextEncoder().encode(
        canonicalSnapshot(data),
      )

    const digest =
      await crypto.subtle.digest(
        'SHA-256',
        encoded,
      )

    return Array.from(
      new Uint8Array(digest),
    )
      .map((value) =>
        value
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  }

  function saveSyncBaseline(
    revisionValue: string | null,
    localHash: string,
  ) {
    if (revisionValue) {
      window.localStorage.setItem(
        'kochwerkNasLastRevision',
        revisionValue,
      )
    } else {
      window.localStorage.removeItem(
        'kochwerkNasLastRevision',
      )
    }

    window.localStorage.setItem(
      'kochwerkNasLastLocalHash',
      localHash,
    )

    const now =
      new Date().toISOString()

    window.localStorage.setItem(
      'kochwerkNasLastSyncAt',
      now,
    )

    setNasLastSyncAt(now)
  }

  async function replaceLocalWithNasData(
    data: BackupData,
  ) {
    await db.transaction(
      'rw',
      db.recipes,
      db.categories,
      db.collections,
      async () => {
        await db.recipes.clear()
        await db.categories.clear()
        await db.collections.clear()

        if (data.recipes.length) {
          await db.recipes.bulkAdd(
            data.recipes,
          )
        }

        if (
          data.categories.length
        ) {
          await db.categories.bulkAdd(
            data.categories,
          )
        }

        if (
          data.collections.length
        ) {
          await db.collections.bulkAdd(
            data.collections,
          )
        }
      },
    )

    await loadAllData()
  }

  async function autoSyncWithNas(
    urlValue: string,
    keyValue: string,
    initialRun: boolean,
  ) {
    const cleanUrl =
      urlValue.trim()
    const cleanKey =
      keyValue.trim()

    if (
      !cleanUrl ||
      !cleanKey
    ) {
      setNasSyncStatus('off')
      return
    }

    if (
      nasSyncStatus ===
      'syncing'
    ) {
      return
    }

    setNasSyncStatus('syncing')

    try {
      const separator =
        cleanUrl.includes('?')
          ? '&'
          : '?'

      const pullResponse =
        await fetch(
          `${cleanUrl}${separator}action=pull`,
          {
            method: 'GET',
            headers: {
              'X-Kochwerk-Key':
                cleanKey,
            },
            cache: 'no-store',
          },
        )

      const pullResult =
        await pullResponse.json() as {
          ok?: boolean
          exists?: boolean
          revision?: string | null
          updatedAt?: string | null
          data?: BackupData | null
          error?: string
        }

      if (
        !pullResponse.ok ||
        !pullResult.ok
      ) {
        throw new Error(
          pullResult.error ??
            `HTTP ${pullResponse.status}`,
        )
      }

      const localData =
        await readLocalSnapshot()
      const localHash =
        await hashSnapshot(
          localData,
        )

      const lastRevision =
        window.localStorage.getItem(
          'kochwerkNasLastRevision',
        )
      const lastLocalHash =
        window.localStorage.getItem(
          'kochwerkNasLastLocalHash',
        )

      if (
        !pullResult.exists ||
        !pullResult.data
      ) {
        if (
          localData.recipes.length === 0 &&
          localData.categories.length === 0 &&
          localData.collections.length === 0
        ) {
          saveSyncBaseline(
            null,
            localHash,
          )
          setNasSyncStatus(
            'synced',
          )
          return
        }

        const pushResponse =
          await fetch(
            `${cleanUrl}${separator}action=push`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
                'X-Kochwerk-Key':
                  cleanKey,
              },
              body: JSON.stringify({
                data: localData,
                baseRevision: null,
                force: false,
              }),
            },
          )

        const pushResult =
          await pushResponse.json() as {
            ok?: boolean
            revision?: string | null
            error?: string
          }

        if (
          !pushResponse.ok ||
          !pushResult.ok
        ) {
          throw new Error(
            pushResult.error ??
              `HTTP ${pushResponse.status}`,
          )
        }

        saveSyncBaseline(
          pushResult.revision ?? null,
          localHash,
        )
        setNasRevision(
          pushResult.revision ??
            null,
        )
        setNasDataExists(true)
        setNasSyncStatus(
          'synced',
        )
        return
      }

      const nasData: BackupData = {
        app: 'Kochwerk',
        backupVersion: 1,
        createdAt:
          pullResult.updatedAt ??
          new Date().toISOString(),
        recipes:
          pullResult.data.recipes,
        categories:
          pullResult.data.categories,
        collections:
          pullResult.data.collections,
      }

      const nasHash =
        await hashSnapshot(
          nasData,
        )

      const currentRevision =
        pullResult.revision ?? null

      setNasRevision(
        currentRevision,
      )
      setNasDataExists(true)

      if (
        !lastRevision ||
        !lastLocalHash
      ) {
        if (
          localHash === nasHash
        ) {
          saveSyncBaseline(
            currentRevision,
            localHash,
          )
          setNasSyncStatus(
            'synced',
          )

          if (initialRun) {
            setNasMessage(
              '✓ Automatische NAS-Synchronisation eingerichtet.',
            )
          }
        } else {
          setNasSyncStatus(
            'conflict',
          )
          setNasMessage(
            '⚠️ Lokaler Stand und NAS unterscheiden sich. Automatisch wurde nichts verändert. Bitte NAS-Sync öffnen und den gewünschten Stand prüfen.',
          )
        }

        return
      }

      const localChanged =
        localHash !==
        lastLocalHash
      const nasChanged =
        currentRevision !==
        lastRevision

      if (
        !localChanged &&
        !nasChanged
      ) {
        saveSyncBaseline(
          currentRevision,
          localHash,
        )
        setNasSyncStatus(
          'synced',
        )
        return
      }

      if (
        localChanged &&
        !nasChanged
      ) {
        const pushResponse =
          await fetch(
            `${cleanUrl}${separator}action=push`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
                'X-Kochwerk-Key':
                  cleanKey,
              },
              body: JSON.stringify({
                data: localData,
                baseRevision:
                  currentRevision,
                force: false,
              }),
            },
          )

        const pushResult =
          await pushResponse.json() as {
            ok?: boolean
            revision?: string | null
            error?: string
            currentRevision?: string
          }

        if (
          pushResponse.status ===
          409
        ) {
          setNasSyncStatus(
            'conflict',
          )
          setNasMessage(
            '⚠️ Während der Synchronisation wurde der NAS-Stand verändert. Nichts wurde überschrieben.',
          )
          return
        }

        if (
          !pushResponse.ok ||
          !pushResult.ok
        ) {
          throw new Error(
            pushResult.error ??
              `HTTP ${pushResponse.status}`,
          )
        }

        saveSyncBaseline(
          pushResult.revision ?? null,
          localHash,
        )
        setNasRevision(
          pushResult.revision ??
            null,
        )
        setNasSyncStatus(
          'synced',
        )
        return
      }

      if (
        !localChanged &&
        nasChanged
      ) {
        await replaceLocalWithNasData(
          nasData,
        )

        saveSyncBaseline(
          currentRevision,
          nasHash,
        )
        setNasSyncStatus(
          'synced',
        )
        return
      }

      if (
        localHash === nasHash
      ) {
        saveSyncBaseline(
          currentRevision,
          localHash,
        )
        setNasSyncStatus(
          'synced',
        )
        return
      }

      setNasSyncStatus(
        'conflict',
      )
      setNasMessage(
        '⚠️ Dieses Gerät und der NAS wurden beide verändert. Zur Sicherheit wurde nichts überschrieben. Bitte NAS-Sync öffnen.',
      )
    } catch (error) {
      console.error(
        'Automatische NAS-Synchronisation fehlgeschlagen:',
        error,
      )
      setNasSyncStatus(
        'error',
      )
    }
  }

  async function runNasSyncNow() {
    const cleanUrl =
      nasUrl.trim()
    const cleanKey =
      nasKey.trim()

    if (
      !cleanUrl ||
      !cleanKey
    ) {
      setNasMessage(
        'Bitte zuerst NAS-Adresse und Kochwerk-Schlüssel speichern.',
      )
      return
    }

    await autoSyncWithNas(
      cleanUrl,
      cleanKey,
      false,
    )

    if (
      nasSyncStatus !==
      'conflict'
    ) {
      setNasMessage(
        'Automatische Synchronisation wurde geprüft.',
      )
    }
  }

  function saveNasSettings() {
    const cleanUrl = nasUrl.trim()
    const cleanKey = nasKey.trim()

    if (!cleanUrl) {
      setNasMessage(
        'Bitte die NAS-API-Adresse eingeben.',
      )
      return
    }

    if (!cleanKey) {
      setNasMessage(
        'Bitte den Kochwerk-Schlüssel eingeben.',
      )
      return
    }

    window.localStorage.setItem(
      'kochwerkNasUrl',
      cleanUrl,
    )

    window.localStorage.setItem(
      'kochwerkNasKey',
      cleanKey,
    )

    setNasMessage(
      'NAS-Einstellungen auf diesem Gerät gespeichert.',
    )
  }

  async function testNasConnection() {
    const cleanUrl = nasUrl.trim()
    const cleanKey = nasKey.trim()

    if (!cleanUrl || !cleanKey) {
      setNasMessage(
        'Bitte NAS-Adresse und Kochwerk-Schlüssel eingeben.',
      )
      return
    }

    setNasTesting(true)
    setNasMessage(
      'NAS-Verbindung wird geprüft …',
    )

    try {
      const separator =
        cleanUrl.includes('?')
          ? '&'
          : '?'

      const response =
        await fetch(
          `${cleanUrl}${separator}action=status`,
          {
            method: 'GET',
            headers: {
              'X-Kochwerk-Key':
                cleanKey,
            },
            cache: 'no-store',
          },
        )

      const result =
        await response.json() as {
          ok?: boolean
          service?: string
          apiVersion?: number
          dataExists?: boolean
          revision?: string | null
          updatedAt?: string | null
          error?: string
        }

      if (
        response.ok &&
        result.ok
      ) {
        window.localStorage.setItem(
          'kochwerkNasUrl',
          cleanUrl,
        )

        window.localStorage.setItem(
          'kochwerkNasKey',
          cleanKey,
        )

        setNasDataExists(
          Boolean(result.dataExists),
        )
        setNasRevision(
          result.revision ?? null,
        )

        setNasMessage(
          `✓ NAS-Verbindung funktioniert. ${result.service ?? 'Kochwerk NAS-API'} · API ${result.apiVersion ?? '?'} · Daten auf NAS: ${result.dataExists ? 'vorhanden' : 'noch keine'}.`,
        )
      } else {
        setNasMessage(
          `NAS-Verbindung fehlgeschlagen: ${result.error ?? `HTTP ${response.status}`}`,
        )
      }
    } catch (error) {
      console.error(
        'NAS-Verbindungstest fehlgeschlagen:',
        error,
      )

      setNasMessage(
        'NAS konnte nicht erreicht werden. Bitte Adresse, Schlüssel und Internetverbindung prüfen.',
      )
    } finally {
      setNasTesting(false)
    }
  }

  async function uploadCurrentDataToNas() {
    const cleanUrl = nasUrl.trim()
    const cleanKey = nasKey.trim()

    if (!cleanUrl || !cleanKey) {
      setNasMessage(
        'Bitte zuerst NAS-Adresse und Kochwerk-Schlüssel eintragen und die Verbindung testen.',
      )
      return
    }

    if (nasDataExists) {
      setNasMessage(
        'Auf dem NAS sind bereits Kochwerk-Daten vorhanden. Der Erst-Upload wird deshalb nicht ausgeführt. Zuerst müssen wir den Abgleich einrichten.',
      )
      return
    }

    const confirmed =
      window.confirm(
        `Ersten Kochwerk-Stand auf den NAS übertragen?\n\n` +
          `${recipes.length} Rezepte\n` +
          `${categories.length} Kategorien\n` +
          `${collections.length} Sammlungen\n\n` +
          `Auf dem NAS sind derzeit noch keine Kochwerk-Daten vorhanden.`,
      )

    if (!confirmed) {
      setNasMessage(
        'Erst-Upload abgebrochen.',
      )
      return
    }

    setNasUploading(true)
    setNasMessage(
      'Kochwerk-Daten werden auf den NAS übertragen …',
    )

    try {
      const payload: BackupData = {
        app: 'Kochwerk',
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        recipes,
        categories,
        collections,
      }

      const separator =
        cleanUrl.includes('?')
          ? '&'
          : '?'

      const response =
        await fetch(
          `${cleanUrl}${separator}action=push`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              'X-Kochwerk-Key':
                cleanKey,
            },
            body: JSON.stringify({
              data: payload,
              baseRevision:
                nasRevision,
              force: false,
            }),
          },
        )

      const result =
        await response.json() as {
          ok?: boolean
          revision?: string | null
          updatedAt?: string | null
          recipeCount?: number
          categoryCount?: number
          collectionCount?: number
          error?: string
          currentRevision?: string
        }

      if (
        response.ok &&
        result.ok
      ) {
        setNasDataExists(true)
        setNasRevision(
          result.revision ?? null,
        )

        const uploadedSnapshot =
          await readLocalSnapshot()
        const uploadedHash =
          await hashSnapshot(
            uploadedSnapshot,
          )

        saveSyncBaseline(
          result.revision ?? null,
          uploadedHash,
        )
        setNasSyncStatus(
          'synced',
        )

        setNasMessage(
          `✓ Erst-Upload erfolgreich. NAS enthält jetzt ${result.recipeCount ?? recipes.length} Rezepte, ${result.categoryCount ?? categories.length} Kategorien und ${result.collectionCount ?? collections.length} Sammlungen.`,
        )
      } else if (
        response.status === 409
      ) {
        setNasDataExists(true)
        setNasRevision(
          result.currentRevision ?? null,
        )

        setNasMessage(
          'Der NAS hat inzwischen bereits einen anderen Stand. Es wurde nichts überschrieben. Bitte zuerst den NAS-Stand neu prüfen.',
        )
      } else {
        setNasMessage(
          `Upload fehlgeschlagen: ${result.error ?? `HTTP ${response.status}`}`,
        )
      }
    } catch (error) {
      console.error(
        'NAS-Erst-Upload fehlgeschlagen:',
        error,
      )

      setNasMessage(
        'Die Kochwerk-Daten konnten nicht auf den NAS übertragen werden.',
      )
    } finally {
      setNasUploading(false)
    }
  }

  async function checkNasDataWithoutImport() {
    const cleanUrl = nasUrl.trim()
    const cleanKey = nasKey.trim()

    if (!cleanUrl || !cleanKey) {
      setNasMessage(
        'Bitte zuerst NAS-Adresse und Kochwerk-Schlüssel eintragen.',
      )
      return
    }

    setNasPullChecking(true)
    setNasPreview(null)
    setNasMessage(
      'NAS-Stand wird gelesen …',
    )

    try {
      const separator =
        cleanUrl.includes('?')
          ? '&'
          : '?'

      const response =
        await fetch(
          `${cleanUrl}${separator}action=pull`,
          {
            method: 'GET',
            headers: {
              'X-Kochwerk-Key':
                cleanKey,
            },
            cache: 'no-store',
          },
        )

      const result =
        await response.json() as {
          ok?: boolean
          exists?: boolean
          revision?: string | null
          updatedAt?: string | null
          data?: {
            recipes?: unknown[]
            categories?: unknown[]
            collections?: unknown[]
          } | null
          error?: string
        }

      if (
        response.ok &&
        result.ok
      ) {
        setNasRevision(
          result.revision ?? null,
        )
        setNasDataExists(
          Boolean(result.exists),
        )

        if (
          result.exists &&
          result.data
        ) {
          const recipeCount =
            Array.isArray(
              result.data.recipes,
            )
              ? result.data.recipes.length
              : 0

          const categoryCount =
            Array.isArray(
              result.data.categories,
            )
              ? result.data.categories.length
              : 0

          const collectionCount =
            Array.isArray(
              result.data.collections,
            )
              ? result.data.collections.length
              : 0

          setNasPreview({
            recipeCount,
            categoryCount,
            collectionCount,
            updatedAt:
              result.updatedAt ?? null,
          })

          setNasPulledData({
            app: 'Kochwerk',
            backupVersion: 1,
            createdAt:
              result.updatedAt ??
              new Date().toISOString(),
            recipes:
              result.data.recipes as Recipe[],
            categories:
              result.data.categories as Category[],
            collections:
              result.data.collections as Collection[],
          })

          setNasMessage(
            '✓ NAS-Stand erfolgreich gelesen. Lokal wurde nichts verändert.',
          )
        } else {
          setNasPulledData(null)
          setNasPreview(null)
          setNasMessage(
            'Auf dem NAS sind noch keine Kochwerk-Daten vorhanden.',
          )
        }
      } else {
        setNasMessage(
          `NAS-Stand konnte nicht gelesen werden: ${result.error ?? `HTTP ${response.status}`}`,
        )
      }
    } catch (error) {
      console.error(
        'NAS-Stand prüfen fehlgeschlagen:',
        error,
      )

      setNasMessage(
        'NAS-Stand konnte nicht gelesen werden. Bitte Verbindung prüfen.',
      )
    } finally {
      setNasPullChecking(false)
    }
  }

  async function applyNasDataToThisDevice() {
    if (!nasPulledData) {
      setNasMessage(
        'Bitte zuerst den NAS-Stand prüfen.',
      )
      return
    }

    const confirmed =
      window.confirm(
        `NAS-Stand auf dieses Gerät übernehmen?\n\n` +
          `${nasPulledData.recipes.length} Rezepte\n` +
          `${nasPulledData.categories.length} Kategorien\n` +
          `${nasPulledData.collections.length} Sammlungen\n\n` +
          `Der aktuelle lokale Kochwerk-Stand auf diesem Gerät wird vorher automatisch als Sicherungsdatei heruntergeladen und danach durch den NAS-Stand ersetzt.`,
      )

    if (!confirmed) {
      setNasMessage(
        'Übernahme des NAS-Stands abgebrochen.',
      )
      return
    }

    setNasApplying(true)
    setNasMessage(
      'Lokale Sicherung wird erstellt und NAS-Stand übernommen …',
    )

    try {
      const localBackup: BackupData = {
        app: 'Kochwerk',
        backupVersion: 1,
        createdAt:
          new Date().toISOString(),
        recipes,
        categories,
        collections,
      }

      const backupBlob =
        new Blob(
          [
            JSON.stringify(
              localBackup,
              null,
              2,
            ),
          ],
          {
            type: 'application/json',
          },
        )

      const backupUrl =
        URL.createObjectURL(
          backupBlob,
        )

      const backupLink =
        document.createElement('a')

      backupLink.href =
        backupUrl

      backupLink.download =
        `kochwerk-vor-nas-uebernahme-${new Date()
          .toISOString()
          .replace(/[:.]/g, '-')}.json`

      document.body.appendChild(
        backupLink,
      )
      backupLink.click()
      backupLink.remove()
      URL.revokeObjectURL(
        backupUrl,
      )

      await db.transaction(
        'rw',
        db.recipes,
        db.categories,
        db.collections,
        async () => {
          await db.recipes.clear()
          await db.categories.clear()
          await db.collections.clear()

          if (
            nasPulledData.recipes.length
          ) {
            await db.recipes.bulkAdd(
              nasPulledData.recipes,
            )
          }

          if (
            nasPulledData.categories.length
          ) {
            await db.categories.bulkAdd(
              nasPulledData.categories,
            )
          }

          if (
            nasPulledData.collections.length
          ) {
            await db.collections.bulkAdd(
              nasPulledData.collections,
            )
          }
        },
      )

      await loadAllData()

      const appliedHash =
        await hashSnapshot(
          nasPulledData,
        )

      saveSyncBaseline(
        nasRevision,
        appliedHash,
      )
      setNasSyncStatus(
        'synced',
      )

      setNasMessage(
        `✓ NAS-Stand übernommen. Dieses Gerät enthält jetzt ${nasPulledData.recipes.length} Rezepte, ${nasPulledData.categories.length} Kategorien und ${nasPulledData.collections.length} Sammlungen. Vorher wurde automatisch eine lokale Sicherungsdatei erstellt.`,
      )
    } catch (error) {
      console.error(
        'NAS-Stand übernehmen fehlgeschlagen:',
        error,
      )

      setNasMessage(
        'NAS-Stand konnte nicht übernommen werden. Der bisherige lokale Stand wurde nicht absichtlich gelöscht; bitte noch nichts weiter ändern und den Fehler prüfen.',
      )
    } finally {
      setNasApplying(false)
    }
  }

  function createBackup() {
    const backup: BackupData = {
      app: 'Kochwerk',
      backupVersion: 1,
      createdAt: new Date().toISOString(),
      recipes,
      categories,
      collections,
    }

    const json = JSON.stringify(
      backup,
      null,
      2,
    )

    const blob = new Blob(
      [json],
      {
        type: 'application/json',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const now = new Date()

    const date =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, '0')}-` +
      `${String(now.getDate()).padStart(2, '0')}`

    const time =
      `${String(now.getHours()).padStart(2, '0')}-` +
      `${String(now.getMinutes()).padStart(2, '0')}`

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      `Kochwerk-Sicherung_${date}_${time}.json`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    setBackupMessage(
      `Sicherung erstellt: ${recipes.length} Rezepte, ${categories.length} Kategorien und ${collections.length} Sammlungen.`,
    )
  }

  async function restoreBackup(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    try {
      setBackupMessage(
        'Sicherung wird geprüft …',
      )

      const text =
        await file.text()

      const parsed =
        JSON.parse(text) as Partial<BackupData>

      if (
        parsed.app !== 'Kochwerk' ||
        parsed.backupVersion !== 1 ||
        !Array.isArray(parsed.recipes) ||
        !Array.isArray(parsed.categories) ||
        !Array.isArray(parsed.collections)
      ) {
        setBackupMessage(
          'Diese Datei ist keine gültige Kochwerk-Sicherung.',
        )
        return
      }

      const backupRecipes = parsed.recipes
      const backupCategories = parsed.categories
      const backupCollections = parsed.collections

      const restoredRecipes =
        backupRecipes.map((recipe) => ({
          ...recipe,

          createdAt:
            recipe.createdAt
              ? new Date(recipe.createdAt)
              : new Date(),

          updatedAt:
            recipe.updatedAt
              ? new Date(recipe.updatedAt)
              : new Date(),

          ingredients:
            recipe.ingredients ?? [],

          preparation:
            recipe.preparation ?? [],

          categoryIds:
            recipe.categoryIds ?? [],

          collectionIds:
            recipe.collectionIds ?? [],

          imageIds:
            recipe.imageIds ?? [],

          favorite:
            recipe.favorite ?? false,
        }))

      if (backupRestoreMode === 'replace') {
        const confirmed =
          window.confirm(
            `Sicherung komplett wiederherstellen?\n\n` +
              `ACHTUNG: Die aktuelle Kochwerk-Datenbank wird vollständig durch diese Sicherung ersetzt.\n\n` +
              `In der Sicherung befinden sich:\n` +
              `${backupRecipes.length} Rezepte\n` +
              `${backupCategories.length} Kategorien\n` +
              `${backupCollections.length} Sammlungen`,
          )

        if (!confirmed) {
          setBackupMessage(
            'Wiederherstellung abgebrochen.',
          )
          return
        }

        await db.transaction(
          'rw',
          db.recipes,
          db.categories,
          db.collections,
          async () => {
            await db.recipes.clear()
            await db.categories.clear()
            await db.collections.clear()

            if (
              backupCategories.length > 0
            ) {
              await db.categories.bulkPut(
                backupCategories,
              )
            }

            if (
              backupCollections.length > 0
            ) {
              await db.collections.bulkPut(
                backupCollections,
              )
            }

            if (
              restoredRecipes.length > 0
            ) {
              await db.recipes.bulkPut(
                restoredRecipes,
              )
            }
          },
        )

        setBackupMessage(
          `Sicherung komplett wiederhergestellt: ${restoredRecipes.length} Rezepte.`,
        )
      } else {
        const confirmed =
          window.confirm(
            `Sicherung zusammenführen?\n\n` +
              `Deine vorhandenen Rezepte bleiben erhalten. Fehlende Rezepte, Kategorien und Sammlungen aus der Sicherung werden ergänzt. Doppelte Rezepte werden übersprungen.\n\n` +
              `In der Sicherung befinden sich:\n` +
              `${backupRecipes.length} Rezepte\n` +
              `${backupCategories.length} Kategorien\n` +
              `${backupCollections.length} Sammlungen`,
          )

        if (!confirmed) {
          setBackupMessage(
            'Zusammenführen abgebrochen.',
          )
          return
        }

        let addedRecipes = 0
        let skippedRecipes = 0
        let addedCategories = 0
        let addedCollections = 0

        await db.transaction(
          'rw',
          db.recipes,
          db.categories,
          db.collections,
          async () => {
            const currentCategories =
              await db.categories.toArray()

            const currentCollections =
              await db.collections.toArray()

            const currentRecipes =
              await db.recipes.toArray()

            const categoryIdMap =
              new Map<number, number>()

            const collectionIdMap =
              new Map<number, number>()

            const normalize = (value?: string) =>
              (value ?? '')
                .trim()
                .toLocaleLowerCase('de-CH')

            for (const category of backupCategories) {
              const existing =
                currentCategories.find(
                  (item) =>
                    normalize(item.name) ===
                    normalize(category.name),
                )

              let targetId = existing?.id

              if (!targetId) {
                const categoryWithoutId = { ...category }
                delete categoryWithoutId.id

                targetId = await db.categories.add({
                  ...categoryWithoutId,
                  sortOrder:
                    category.sortOrder ??
                    currentCategories.length +
                      addedCategories,
                })

                addedCategories += 1
              }

              if (category.id && targetId) {
                categoryIdMap.set(
                  category.id,
                  targetId,
                )
              }
            }

            for (const collection of backupCollections) {
              const existing =
                currentCollections.find(
                  (item) =>
                    normalize(item.name) ===
                    normalize(collection.name),
                )

              let targetId = existing?.id

              if (!targetId) {
                const collectionWithoutId = { ...collection }
                delete collectionWithoutId.id

                targetId = await db.collections.add({
                  ...collectionWithoutId,
                  sortOrder:
                    collection.sortOrder ??
                    currentCollections.length +
                      addedCollections,
                })

                addedCollections += 1
              }

              if (collection.id && targetId) {
                collectionIdMap.set(
                  collection.id,
                  targetId,
                )
              }
            }

            const recipeKey = (recipe: Recipe) => {
              const title = normalize(recipe.title)
              const sourceUrl = normalize(recipe.sourceUrl)
              const sourceName = normalize(recipe.sourceName)

              return sourceUrl
                ? `${title}|url:${sourceUrl}`
                : `${title}|source:${sourceName}`
            }

            const existingRecipeKeys =
              new Set(
                currentRecipes.map(recipeKey),
              )

            for (const recipe of restoredRecipes) {
              const key = recipeKey(recipe)

              if (existingRecipeKeys.has(key)) {
                skippedRecipes += 1
                continue
              }

              const recipeWithoutId = { ...recipe }
              delete recipeWithoutId.id

              const mappedCategoryIds =
                (recipe.categoryIds ?? [])
                  .map((id) => categoryIdMap.get(id))
                  .filter(
                    (id): id is number =>
                      typeof id === 'number',
                  )

              const mappedCollectionIds =
                (recipe.collectionIds ?? [])
                  .map((id) => collectionIdMap.get(id))
                  .filter(
                    (id): id is number =>
                      typeof id === 'number',
                  )

              await db.recipes.add({
                ...recipeWithoutId,
                categoryIds: mappedCategoryIds,
                collectionIds: mappedCollectionIds,
              })

              existingRecipeKeys.add(key)
              addedRecipes += 1
            }
          },
        )

        setBackupMessage(
          `Sicherung zusammengeführt: ${addedRecipes} neue Rezepte, ${skippedRecipes} doppelte übersprungen, ${addedCategories} neue Kategorien und ${addedCollections} neue Sammlungen.`,
        )
      }

      setSelectedRecipe(null)
      setSelectedCategory(null)
      setSelectedCollection(null)

      setView('home')

      await loadAllData()
    } catch (error) {
      console.error(
        'Fehler beim Wiederherstellen:',
        error,
      )

      setBackupMessage(
        'Die Sicherung konnte nicht wiederhergestellt werden.',
      )
    }
  }

  async function pasteImportUrlFromClipboard() {
    try {
      if (!navigator.clipboard?.readText) {
        setImportMessage(
          'Die Zwischenablage kann auf diesem Gerät nicht automatisch gelesen werden. Bitte den Link ins Feld einfügen.',
        )
        return
      }

      const clipboardText =
        (await navigator.clipboard.readText()).trim()

      if (!clipboardText) {
        setImportMessage(
          'In der Zwischenablage wurde kein Link gefunden.',
        )
        return
      }

      try {
        const url = new URL(clipboardText)

        if (
          url.protocol !== 'http:' &&
          url.protocol !== 'https:'
        ) {
          throw new Error('Ungültiges Protokoll')
        }
      } catch {
        setImportMessage(
          'Die Zwischenablage enthält keinen gültigen Webseiten-Link.',
        )
        return
      }

      setImportUrl(clipboardText)
      setImportMessage(
        'Link aus der Zwischenablage eingefügt.',
      )
      setRecipePreview(null)
      setImportCategoryIds([])
      setImportCollectionIds([])
      setImportFavorite(false)
      setSaveStatus('idle')
    } catch (error) {
      console.error(
        'Fehler beim Lesen der Zwischenablage:',
        error,
      )

      setImportMessage(
        'Die Zwischenablage konnte nicht gelesen werden. Bitte den Link ins Feld einfügen.',
      )
    }
  }

  function handleFacebookImageFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImportMessage(
        'Bitte eine Bilddatei auswählen.',
      )
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setImportImageUrl(
          reader.result,
        )
        setImportMessage(
          'Bild übernommen.',
        )
      }
    }

    reader.readAsDataURL(file)
  }

  function getDroppedImageSource(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    const imageFile =
      Array.from(
        event.dataTransfer.files ?? [],
      ).find(
        (file) =>
          file.type.startsWith(
            'image/',
          ),
      )

    if (imageFile) {
      return {
        type: 'file' as const,
        file: imageFile,
      }
    }

    const html =
      event.dataTransfer.getData(
        'text/html',
      )

    if (html) {
      const match =
        html.match(
          /<img[^>]+src=["']([^"']+)["']/i,
        )

      if (match?.[1]) {
        return {
          type: 'url' as const,
          url: match[1],
        }
      }
    }

    const uriList =
      event.dataTransfer.getData(
        'text/uri-list',
      )

    const plainText =
      event.dataTransfer.getData(
        'text/plain',
      )

    const candidate =
      (
        uriList ||
        plainText
      )
        .split(/\r?\n/)
        .map(
          (value) =>
            value.trim(),
        )
        .find(
          (value) =>
            /^https?:\/\//i.test(
              value,
            ),
        )

    if (candidate) {
      return {
        type: 'url' as const,
        url: candidate,
      }
    }

    return null
  }

  function handleFacebookImageDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    const dropped =
      getDroppedImageSource(
        event,
      )

    if (!dropped) {
      setImportMessage(
        'Das gezogene Element konnte nicht als Bild erkannt werden.',
      )
      return
    }

    if (dropped.type === 'url') {
      setImportImageUrl(
        dropped.url,
      )
      setImportMessage(
        'Bild per Drag & Drop übernommen.',
      )
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setImportImageUrl(
          reader.result,
        )
        setImportMessage(
          'Bild per Drag & Drop übernommen.',
        )
      }
    }

    reader.readAsDataURL(
      dropped.file,
    )
  }

  function handleFacebookImageDragOver(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
  }

  async function pasteFacebookImageFromClipboard() {
    try {
      if (!navigator.clipboard?.read) {
        setImportMessage(
          'Ein Bild kann auf diesem Gerät nicht automatisch aus der Zwischenablage gelesen werden. Bitte das Bild vom Gerät auswählen.',
        )
        return
      }

      const items =
        await navigator.clipboard.read()

      for (const item of items) {
        const imageType =
          item.types.find(
            (type) =>
              type.startsWith('image/'),
          )

        if (!imageType) continue

        const blob =
          await item.getType(
            imageType,
          )

        const reader =
          new FileReader()

        const dataUrl =
          await new Promise<string>(
            (resolve, reject) => {
              reader.onload = () => {
                if (
                  typeof reader.result ===
                  'string'
                ) {
                  resolve(
                    reader.result,
                  )
                } else {
                  reject(
                    new Error(
                      'Bild konnte nicht gelesen werden.',
                    ),
                  )
                }
              }

              reader.onerror =
                () =>
                  reject(
                    reader.error ??
                      new Error(
                        'Bild konnte nicht gelesen werden.',
                      ),
                  )

              reader.readAsDataURL(
                blob,
              )
            },
          )

        setImportImageUrl(
          dataUrl,
        )
        setImportMessage(
          'Bild aus der Zwischenablage übernommen.',
        )
        return
      }

      setImportMessage(
        'In der Zwischenablage wurde kein Bild gefunden.',
      )
    } catch (error) {
      console.error(
        'Fehler beim Lesen des Bildes aus der Zwischenablage:',
        error,
      )

      setImportMessage(
        'Das Bild konnte nicht aus der Zwischenablage gelesen werden. Bitte das Bild vom Gerät auswählen.',
      )
    }
  }

  async function pasteFacebookTextFromClipboard() {
    try {
      if (!navigator.clipboard?.readText) {
        setImportMessage(
          'Die Zwischenablage kann auf diesem Gerät nicht automatisch gelesen werden. Bitte den Facebook-Text ins Feld einfügen.',
        )
        return
      }

      const clipboardText =
        (await navigator.clipboard.readText()).trim()

      if (!clipboardText) {
        setImportMessage(
          'In der Zwischenablage wurde kein Text gefunden.',
        )
        return
      }

      setFacebookText(clipboardText)
      setImportMessage(
        'Facebook-Text aus der Zwischenablage eingefügt.',
      )
      setRecipePreview(null)
      setImportNotes('')
      setImportCategoryIds([])
      setImportCollectionIds([])
      setImportFavorite(false)
      setSaveStatus('idle')
    } catch (error) {
      console.error(
        'Fehler beim Lesen der Zwischenablage:',
        error,
      )

      setImportMessage(
        'Die Zwischenablage konnte nicht gelesen werden. Bitte den Facebook-Text ins Feld einfügen.',
      )
    }
  }

  async function handleFacebookTextImport() {
    const text =
      facebookText.trim()

    if (!text) {
      setImportMessage(
        'Bitte zuerst den Text des Facebook-Rezepts einfügen.',
      )
      return
    }

    setImportLoading(true)
    setImportMessage('')
    setRecipePreview(null)
    setImportCategoryIds([])
    setImportCollectionIds([])
    setImportFavorite(false)
    setSaveStatus('idle')

    try {
      const response =
        await fetch(
          'https://kochwerk-import-worker.andy-kochwerk.workers.dev/import-text',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/json',
            },
            body:
              JSON.stringify({
                text,
                sourceName:
                  'facebook.com',
                sourceUrl:
                  sourceUrl ||
                  importUrl ||
                  '',
              }),
          },
        )

      const result =
        await response.json() as {
          success: boolean
          sourceUrl?: string
          sourceName?: string
          recipe?: ImportedRecipe & {
            notes?: string
          }
          error?: string
        }

      if (
        response.ok &&
        result.success &&
        result.recipe
      ) {
        setRecipePreview(result.recipe)
        setSourceUrl(
          result.sourceUrl ?? '',
        )
        setSourceName(
          result.sourceName ??
            'facebook.com',
        )
        setImportNotes(
          result.recipe.notes ??
            '',
        )
        setImportImageUrl(
          (current) =>
            current ||
            result.recipe?.image ||
            '',
        )
        setImportMessage(
          'Facebook-Rezept erkannt.',
        )
      } else {
        setImportMessage(
          result.error ??
            `Der Importdienst antwortet mit Fehler ${response.status}.`,
        )
      }
    } catch (error) {
      console.error(
        'Fehler beim Facebook-Textimport:',
        error,
      )

      setImportMessage(
        'Der Facebook-Text konnte nicht ausgewertet werden.',
      )
    }

    setImportLoading(false)
  }

  function isFacebookImportLink(
    value: string,
  ) {
    try {
      const url =
        new URL(
          value.trim(),
        )

      const host =
        url.hostname
          .toLowerCase()

      return (
        host === 'facebook.com' ||
        host.endsWith(
          '.facebook.com',
        ) ||
        host === 'fb.watch' ||
        host.endsWith(
          '.fb.watch',
        )
      )
    } catch {
      return false
    }
  }

  async function importFacebookLink(
    value: string,
  ) {
    const cleanUrl =
      value.trim()

    try {
      const response =
        await fetch(
          `https://kochwerk-import-worker.andy-kochwerk.workers.dev/import?url=${encodeURIComponent(
            cleanUrl,
          )}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        )

      const result =
        await response.json() as {
          success?: boolean
          sourceUrl?: string
          sourceName?: string
          recipe?: ImportedRecipe & {
            notes?: string
          }
          error?: string
          requiresFacebookText?: boolean
        }

      if (
        response.ok &&
        result.success &&
        result.recipe
      ) {
        setRecipePreview(
          result.recipe,
        )
        setSourceUrl(
          result.sourceUrl ??
            cleanUrl,
        )
        setSourceName(
          result.sourceName ??
            'facebook.com',
        )
        setImportNotes(
          result.recipe.notes ??
            '',
        )
        setImportImageUrl(
          result.recipe.image ??
            '',
        )
        setImportMessage(
          'Facebook-Rezept automatisch erkannt.',
        )
        return true
      }

      setSourceUrl(
        result.sourceUrl ??
          cleanUrl,
      )
      setSourceName(
        result.sourceName ??
          'facebook.com',
      )

      setImportMode(
        'facebookText',
      )

      setImportMessage(
        'Facebook lässt diesen Beitrag nicht vollständig automatisch auslesen. Der Link ist bereits als Quelle gespeichert. Kopiere jetzt nur noch den Beitragstext und tippe auf „Facebook-Rezept auswerten“.',
      )

      return false
    } catch (error) {
      console.error(
        'Facebook-Linkimport fehlgeschlagen:',
        error,
      )

      setSourceUrl(
        cleanUrl,
      )
      setSourceName(
        'facebook.com',
      )
      setImportMode(
        'facebookText',
      )
      setImportMessage(
        'Facebook konnte den direkten Zugriff nicht freigeben. Der Link bleibt als Quelle gespeichert. Kopiere den Beitragstext und füge ihn unten ein.',
      )

      return false
    }
  }

  async function handleImport() {
    setImportLoading(true)
    setImportMessage('')
    setRecipePreview(null)
    setImportNotes('')
    setImportImageUrl('')
    setImportCategoryIds([])
    setImportCollectionIds([])
    setImportFavorite(false)
    setSaveStatus('idle')

    if (
      isFacebookImportLink(
        importUrl,
      )
    ) {
      await importFacebookLink(
        importUrl,
      )
      setImportLoading(false)
      return
    }

    const result =
      await importRecipe(importUrl)

    if (
      result.success &&
      result.recipe
    ) {
      setRecipePreview(result.recipe)
      setSourceUrl(result.sourceUrl)
      setSourceName(
        result.sourceName ?? '',
      )
      setImportNotes('')
      setImportImageUrl(
        result.recipe.image ??
          '',
      )

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

      const existing =
        await db.recipes
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

        description: importNotes,

        categoryIds: importCategoryIds,
        collectionIds: importCollectionIds,

        ingredients:
          recipePreview.ingredients.map(
            (ingredient, index) => ({
              id: `${Date.now()}-${index}`,
              name: ingredient,
            }),
          ),

        preparation:
          recipePreview.instructions,

        servings:
          getServings(
            recipePreview.yield,
          ),

        servingsLabel:
          Array.isArray(
            recipePreview.yield,
          )
            ? recipePreview.yield.join(
                ', ',
              )
            : recipePreview.yield,

        prepTimeMinutes:
          durationToMinutes(
            recipePreview.prepTime,
          ),

        cookingTimeMinutes:
          durationToMinutes(
            recipePreview.cookTime,
          ),

        totalTimeMinutes:
          durationToMinutes(
            recipePreview.totalTime,
          ),

        sourceUrl,
        sourceName,

        sourceImageUrl:
          importImageUrl ||
          recipePreview.image,

        imageIds: [],

        favorite: importFavorite,

        createdAt: now,
        updatedAt: now,
      })

      setSaveStatus('saved')
      setImportUrl('')
      setFacebookText('')

      await loadRecipes()
    } catch (error) {
      console.error(
        'Fehler beim Speichern:',
        error,
      )

      setSaveStatus('error')
    }
  }

  function toggleImportCategory(
    categoryId: number,
  ) {
    setImportCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(
            (id) =>
              id !== categoryId,
          )
        : [
            ...current,
            categoryId,
          ],
    )
  }

  function toggleImportCollection(
    collectionId: number,
  ) {
    setImportCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter(
            (id) =>
              id !== collectionId,
          )
        : [
            ...current,
            collectionId,
          ],
    )
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

    const newValue =
      !selectedRecipe.favorite

    const updatedAt =
      new Date()

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

    const confirmed =
      window.confirm(
        `Möchtest du "${selectedRecipe.title}" wirklich löschen?`,
      )

    if (!confirmed) return

    await db.recipes.delete(
      selectedRecipe.id,
    )

    setSelectedRecipe(null)

    await loadRecipes()
  }

  function openEdit() {
    if (!selectedRecipe) return

    setEditTitle(
      selectedRecipe.title,
    )

    setEditServings(
      selectedRecipe.servingsLabel ??
        '',
    )

    setEditTime(
      selectedRecipe.totalTimeMinutes
        ? String(
            selectedRecipe.totalTimeMinutes,
          )
        : '',
    )

    setEditIngredients(
      (
        selectedRecipe.ingredients ??
        []
      )
        .map(
          (ingredient) =>
            ingredient.name,
        )
        .join('\n'),
    )

    setEditPreparation(
      (
        selectedRecipe.preparation ??
        []
      ).join('\n'),
    )

    setEditCategoryIds(
      selectedRecipe.categoryIds ??
        [],
    )

    setEditCollectionIds(
      selectedRecipe.collectionIds ??
        [],
    )

    setEditNotes(
      selectedRecipe.description ??
        '',
    )

    setEditSourceUrl(
      selectedRecipe.sourceUrl ??
        '',
    )

    setEditSourceName(
      selectedRecipe.sourceName ??
        '',
    )

    setEditImageUrl(
      selectedRecipe.sourceImageUrl ??
        '',
    )

    setEditFavorite(
      selectedRecipe.favorite ??
        false,
    )

    setShowEdit(true)
  }

  function handleEditImageFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      window.alert(
        'Bitte eine Bilddatei auswählen.',
      )
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setEditImageUrl(
          reader.result,
        )
      }
    }

    reader.readAsDataURL(file)
  }

  function handleEditImageDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    const dropped =
      getDroppedImageSource(
        event,
      )

    if (!dropped) {
      window.alert(
        'Das gezogene Element konnte nicht als Bild erkannt werden.',
      )
      return
    }

    if (dropped.type === 'url') {
      setEditImageUrl(
        dropped.url,
      )
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setEditImageUrl(
          reader.result,
        )
      }
    }

    reader.readAsDataURL(
      dropped.file,
    )
  }

  function handleEditImageDragOver(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
  }

  async function saveEdit() {
    if (!selectedRecipe?.id) return

    const ingredients =
      editIngredients
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

    const parsedTime =
      Number(editTime)

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
          Number.isFinite(
            parsedTime,
          ) && parsedTime > 0
            ? parsedTime
            : undefined,

        ingredients,

        preparation,

        categoryIds:
          editCategoryIds,

        collectionIds:
          editCollectionIds,

        description:
          editNotes.trim(),

        sourceUrl:
          editSourceUrl.trim() ||
          undefined,

        sourceName:
          editSourceName.trim() ||
          undefined,

        sourceImageUrl:
          editImageUrl.trim() ||
          undefined,

        favorite:
          editFavorite,

        updatedAt:
          new Date(),
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
    const title =
      newTitle.trim()

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

    const parsedTime =
      Number(newTime)

    const now =
      new Date()

    const newId =
      await db.recipes.add({
        title,

        description: '',

        categoryIds:
          newCategoryIds,

        collectionIds:
          newCollectionIds,

        ingredients,

        preparation,

        servingsLabel:
          newServings.trim() ||
          undefined,

        totalTimeMinutes:
          Number.isFinite(
            parsedTime,
          ) && parsedTime > 0
            ? parsedTime
            : undefined,

        imageIds: [],

        favorite: false,

        createdAt: now,
        updatedAt: now,
      })

    await loadRecipes()

    const createdRecipe =
      await db.recipes.get(
        newId,
      )

    setShowNewRecipe(false)

    setView('recipes')

    if (createdRecipe) {
      setSelectedRecipe(
        createdRecipe,
      )
    }
  }

  function toggleNewCategory(
    categoryId: number,
  ) {
    setNewCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(
            (id) =>
              id !== categoryId,
          )
        : [
            ...current,
            categoryId,
          ],
    )
  }

  function toggleEditCategory(
    categoryId: number,
  ) {
    setEditCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter(
            (id) =>
              id !== categoryId,
          )
        : [
            ...current,
            categoryId,
          ],
    )
  }

  function toggleNewCollection(
    collectionId: number,
  ) {
    setNewCollectionIds((current) =>
      current.includes(
        collectionId,
      )
        ? current.filter(
            (id) =>
              id !== collectionId,
          )
        : [
            ...current,
            collectionId,
          ],
    )
  }

  function toggleEditCollection(
    collectionId: number,
  ) {
    setEditCollectionIds(
      (current) =>
        current.includes(
          collectionId,
        )
          ? current.filter(
              (id) =>
                id !== collectionId,
            )
          : [
              ...current,
              collectionId,
            ],
    )
  }

  function openNewCategory() {
    setNewCategoryName('')
    setNewCategoryIcon('🍽️')
    setNewCustomEmoji('')

    setShowNewCategory(true)
  }

  async function saveNewCategory() {
    const name =
      newCategoryName.trim()

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
      sortOrder:
        categories.length,
    })

    setShowNewCategory(false)

    await loadCategories()
  }

  function openCategory(
    category: Category,
  ) {
    setSelectedCategory(category)

    setView(
      'categoryRecipes',
    )
  }

  function openCategoryEdit(
    category: Category,
  ) {
    setSelectedCategory(
      category,
    )

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
    if (!selectedCategory?.id)
      return

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
          recipe.categoryIds ??
          []
        ).includes(
          category.id!,
        ),
      )

    for (
      const recipe of
      affectedRecipes
    ) {
      if (!recipe.id) continue

      await db.recipes.update(
        recipe.id,
        {
          categoryIds: (
            recipe.categoryIds ??
            []
          ).filter(
            (id) =>
              id !== category.id,
          ),

          updatedAt:
            new Date(),
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

      sortOrder:
        collections.length,
    })

    setShowNewCollection(false)

    await loadCollections()
  }

  function openCollection(
    collection: Collection,
  ) {
    setSelectedCollection(
      collection,
    )

    setView(
      'collectionRecipes',
    )
  }

  function openCollectionEdit(
    collection: Collection,
  ) {
    setSelectedCollection(
      collection,
    )

    setEditCollectionName(
      collection.name,
    )

    setEditCollectionDescription(
      collection.description ??
        '',
    )

    setShowEditCollection(true)
  }

  async function saveCollectionEdit() {
    if (
      !selectedCollection?.id
    )
      return

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
          recipe.collectionIds ??
          []
        ).includes(
          collection.id!,
        ),
      )

    for (
      const recipe of
      affectedRecipes
    ) {
      if (!recipe.id) continue

      await db.recipes.update(
        recipe.id,
        {
          collectionIds: (
            recipe.collectionIds ??
            []
          ).filter(
            (id) =>
              id !== collection.id,
          ),

          updatedAt:
            new Date(),
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
    if (
      categories.length === 0
    ) {
      return (
        <p>
          Noch keine Kategorien vorhanden.
        </p>
      )
    }

    return (
      <div>
        {categories.map(
          (category) => {
            if (!category.id)
              return null

            return (
              <label
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '10px',
                  marginTop:
                    '10px',
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(
                    category.id,
                  )}
                  onChange={() =>
                    toggle(
                      category.id!,
                    )
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
          },
        )}
      </div>
    )
  }

  function renderCollectionChoices(
    selectedIds: number[],
    toggle: (id: number) => void,
  ) {
    if (
      collections.length === 0
    ) {
      return (
        <p>
          Noch keine Sammlungen vorhanden.
        </p>
      )
    }

    return (
      <div>
        {collections.map(
          (collection) => {
            if (!collection.id)
              return null

            return (
              <label
                key={
                  collection.id
                }
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '10px',
                  marginTop:
                    '10px',
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(
                    collection.id,
                  )}
                  onChange={() =>
                    toggle(
                      collection.id!,
                    )
                  }
                  style={{
                    width: 'auto',
                    margin: 0,
                  }}
                />

                <span>
                  🗃️{' '}
                  {
                    collection.name
                  }
                </span>
              </label>
            )
          },
        )}
      </div>
    )
  }

  function renderIconPicker(
    selectedIcon:
      | string
      | undefined,

    onSelect: (
      icon:
        | string
        | undefined,
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

            marginTop:
              '10px',

            marginBottom:
              '16px',
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

              borderRadius:
                '13px',

              cursor: 'pointer',

              fontSize:
                '0.78rem',

              fontWeight: 700,

              border:
                selectedIcon ===
                undefined
                  ? '3px solid #ef7658'
                  : '1px solid #e4dbd1',

              background:
                selectedIcon ===
                undefined
                  ? '#fff1ec'
                  : '#fbfaf8',
            }}
          >
            Ohne
          </button>

          {CATEGORY_ICONS.map(
            (icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onSelect(icon)
                  setCustomEmoji('')
                }}
                style={{
                  height: '52px',

                  borderRadius:
                    '13px',

                  cursor:
                    'pointer',

                  fontSize:
                    '1.65rem',

                  border:
                    selectedIcon ===
                    icon
                      ? '3px solid #ef7658'
                      : '1px solid #e4dbd1',

                  background:
                    selectedIcon ===
                    icon
                      ? '#fff1ec'
                      : '#fbfaf8',
                }}
              >
                {icon}
              </button>
            ),
          )}
        </div>

        <label>
          Eigenes Emoji

          <input
            value={customEmoji}
            onChange={(event) => {
              const value =
                event.target.value

              setCustomEmoji(
                value,
              )

              if (value.trim()) {
                onSelect(
                  value.trim(),
                )
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
                : view ===
                    'search'
                  ? `Keine Rezepte für „${searchQuery}“ gefunden.`
                  : 'Noch keine Rezepte gespeichert.'}
        </div>
      )
    }

    return (
      <div className="recipe-grid">
        {list.map(
          (recipe) => {
            const recipeCategories =
              categoryNameList(
                recipe,
              )

            const recipeCollections =
              collectionNameList(
                recipe,
              )

            return (
              <button
                type="button"
                className="recipe-card recipe-card-button"
                key={recipe.id}
                onClick={() =>
                  setSelectedRecipe(
                    recipe,
                  )
                }
              >
                {recipe.sourceImageUrl ? (
                  <img
                    src={
                      recipe.sourceImageUrl
                    }
                    alt={
                      recipe.title
                    }
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
                      {
                        recipe.title
                      }
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
          },
        )}
      </div>
    )
  }

  const favoriteRecipes =
    recipes.filter(
      (recipe) =>
        recipe.favorite,
    )

  const categoryRecipes =
    selectedCategory?.id
      ? recipes.filter(
          (recipe) =>
            (
              recipe.categoryIds ??
              []
            ).includes(
              selectedCategory.id!,
            ),
        )
      : []

  const collectionRecipes =
    selectedCollection?.id
      ? recipes.filter(
          (recipe) =>
            (
              recipe.collectionIds ??
              []
            ).includes(
              selectedCollection.id!,
            ),
        )
      : []

  const searchResults =
    recipes
      .filter(
        recipeMatchesSearch,
      )
      .sort((a, b) => {
        if (searchSort === 'updated') {
          const aTime = a.updatedAt
            ? new Date(a.updatedAt).getTime()
            : 0

          const bTime = b.updatedAt
            ? new Date(b.updatedAt).getTime()
            : 0

          return bTime - aTime
        }

        return a.title.localeCompare(
          b.title,
          'de',
          { sensitivity: 'base' },
        )
      })


  function isPrintNoiseLine(
    text: string,
    recipeTitle: string,
  ) {
    const clean = text.trim()
    const lower = clean.toLowerCase()
    const titleLower =
      recipeTitle.trim().toLowerCase()

    if (!clean) return true

    if (
      lower === 'add comment' ||
      lower === 'comment' ||
      lower === 'comments'
    ) {
      return true
    }

    if (
      /^\d+\s+views?$/.test(lower) ||
      /^\d+\s+(years?|jahre?n?|months?|monaten?|days?|tagen?|hours?|stunden?)\s+ago$/.test(
        lower,
      )
    ) {
      return true
    }

    if (
      lower.includes('facebook') ||
      lower.includes('teilen') ||
      lower.includes('zur nächsten seite') ||
      lower.includes('zur naechsten seite') ||
      lower.includes('kochschritte abzuschließen') ||
      lower.includes('kochschritte abzuschliessen')
    ) {
      return true
    }

    if (
      /^by\s+.+/i.test(clean) &&
      clean.length < 80
    ) {
      return true
    }

    if (
      titleLower &&
      lower === titleLower
    ) {
      return true
    }

    return false
  }

  function printableIngredients(
    recipe: Recipe,
  ) {
    return (
      recipe.ingredients ?? []
    ).filter(
      (ingredient) =>
        !isPrintNoiseLine(
          ingredient.name,
          recipe.title,
        ),
    )
  }

  function printablePreparation(
    recipe: Recipe,
  ) {
    return (
      recipe.preparation ?? []
    ).filter(
      (step) =>
        !isPrintNoiseLine(
          step,
          recipe.title,
        ),
    )
  }

  function printableNotes(
    recipe: Recipe,
  ) {
    return (
      recipe.description ?? ''
    )
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          !isPrintNoiseLine(
            line,
            recipe.title,
          ),
      )
      .join('\n')
  }

  function printDensityClass(
    recipe: Recipe,
  ) {
    const ingredientLines =
      printableIngredients(recipe)
    const preparationLines =
      printablePreparation(recipe)
    const notes =
      printableNotes(recipe)

    const ingredientChars =
      ingredientLines.reduce(
        (sum, ingredient) =>
          sum +
          ingredient.name.length,
        0,
      )

    const preparationChars =
      preparationLines.reduce(
        (sum, step) =>
          sum + step.length,
        0,
      )

    const totalWeight =
      ingredientLines.length * 42 +
      preparationLines.length * 54 +
      ingredientChars * 0.55 +
      preparationChars +
      notes.length * 0.85

    if (totalWeight > 6100) {
      return 'print-density-ultra'
    }

    if (totalWeight > 4300) {
      return 'print-density-very-compact'
    }

    if (totalWeight > 2800) {
      return 'print-density-compact'
    }

    if (totalWeight < 1500) {
      return 'print-density-short'
    }

    return 'print-density-normal'
  }

  function printSourceLabel(
    recipe: Recipe,
  ) {
    if (recipe.sourceName?.trim()) {
      return recipe.sourceName.trim()
    }

    if (recipe.sourceUrl?.trim()) {
      try {
        const url =
          new URL(
            recipe.sourceUrl,
          )
        return url.hostname.replace(
          /^www\./,
          '',
        )
      } catch {
        return 'Online-Rezept'
      }
    }

    return ''
  }

  function printCurrentRecipe() {
    if (!selectedRecipe) return
    window.print()
  }


  return (
    <div className="app">
      <style>{`
        .print-recipe-page {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 7mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .header,
          footer,
          .recipe-detail > :not(.print-recipe-page),
          .modal-backdrop {
            display: none !important;
          }

          #root,
          .app,
          .content,
          .recipe-detail {
            display: block !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .print-recipe-page,
          .print-recipe-page * {
            visibility: visible !important;
          }

          .print-recipe-page {
            display: block !important;
            position: static !important;
            width: 196mm !important;
            box-sizing: border-box !important;
            color: #222 !important;
            background: #fff !important;
            font-family: Arial, Helvetica, sans-serif !important;
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }

          .print-recipe-header {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 55mm !important;
            gap: 6mm !important;
            align-items: start !important;
            padding-bottom: 3.5mm !important;
            border-bottom: 1.4px solid #cfc8be !important;
          }

          .print-recipe-brand {
            margin-bottom: 2.2mm !important;
            font-size: 8.6pt !important;
            font-weight: 700 !important;
            letter-spacing: 0.02em !important;
            color: #777 !important;
          }

          .print-recipe-title {
            margin: 0 0 2.5mm !important;
            font-size: 22pt !important;
            line-height: 1.04 !important;
            font-weight: 800 !important;
          }

          .print-recipe-meta {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1.6mm 4mm !important;
            font-size: 10.4pt !important;
            line-height: 1.2 !important;
            color: #444 !important;
          }

          .print-recipe-image {
            width: 55mm !important;
            height: 36mm !important;
            object-fit: cover !important;
            border-radius: 3mm !important;
            border: 1px solid #ddd !important;
          }

          .print-recipe-main {
            display: grid !important;
            grid-template-columns: 0.88fr 1.12fr !important;
            gap: 6mm !important;
            margin-top: 4.5mm !important;
            align-items: start !important;
          }

          .print-recipe-block {
            min-width: 0 !important;
            text-align: left !important;
          }

          .print-recipe-block h3 {
            margin: 0 0 2mm !important;
            padding-bottom: 1.2mm !important;
            border-bottom: 1px solid #d8d3cc !important;
            font-size: 13.5pt !important;
            line-height: 1.1 !important;
          }

          .print-recipe-block ul,
          .print-recipe-block ol {
            margin: 0 !important;
            padding-left: 5mm !important;
          }

          .print-recipe-block li {
            margin: 0 0 1.25mm !important;
            padding-left: 0.5mm !important;
            line-height: 1.23 !important;
            text-align: left !important;
          }

          .print-recipe-notes {
            margin-top: 3.8mm !important;
            padding: 2.7mm 3.3mm !important;
            border: 1px solid #ddd7cf !important;
            border-radius: 2.7mm !important;
            background: #faf9f7 !important;
            break-inside: avoid !important;
          }

          .print-recipe-notes h3 {
            margin: 0 0 1.3mm !important;
            font-size: 12pt !important;
          }

          .print-recipe-notes p {
            margin: 0 !important;
            line-height: 1.22 !important;
            white-space: pre-wrap !important;
          }

          .print-recipe-footer {
            display: flex !important;
            justify-content: space-between !important;
            gap: 6mm !important;
            margin-top: 3.5mm !important;
            padding-top: 2mm !important;
            border-top: 1px solid #ddd8d1 !important;
            font-size: 8.2pt !important;
            color: #777 !important;
          }

          .print-density-short {
            font-size: 12.8pt !important;
          }

          .print-density-short .print-recipe-header {
            grid-template-columns: minmax(0, 1fr) 72mm !important;
            gap: 7mm !important;
            padding-bottom: 5mm !important;
          }

          .print-density-short .print-recipe-title {
            font-size: 25pt !important;
            margin-bottom: 3mm !important;
          }

          .print-density-short .print-recipe-meta {
            font-size: 11.2pt !important;
          }

          .print-density-short .print-recipe-image {
            width: 72mm !important;
            height: 48mm !important;
          }

          .print-density-short .print-recipe-main {
            grid-template-columns: 0.82fr 1.18fr !important;
            gap: 8mm !important;
            margin-top: 7mm !important;
          }

          .print-density-short .print-recipe-block h3 {
            font-size: 15pt !important;
            margin-bottom: 3mm !important;
          }

          .print-density-short .print-recipe-block li {
            margin-bottom: 2mm !important;
            line-height: 1.32 !important;
          }

          .print-density-normal {
            font-size: 11.7pt !important;
          }

          .print-density-compact {
            font-size: 10.5pt !important;
          }

          .print-density-compact .print-recipe-title {
            font-size: 20pt !important;
          }

          .print-density-compact .print-recipe-image {
            height: 31mm !important;
          }

          .print-density-compact .print-recipe-main {
            gap: 5mm !important;
            margin-top: 3.8mm !important;
          }

          .print-density-compact .print-recipe-block li {
            margin-bottom: 0.9mm !important;
            line-height: 1.18 !important;
          }

          .print-density-very-compact {
            font-size: 9.6pt !important;
          }

          .print-density-very-compact .print-recipe-header {
            grid-template-columns: minmax(0, 1fr) 47mm !important;
            gap: 4.5mm !important;
          }

          .print-density-very-compact .print-recipe-title {
            font-size: 18.5pt !important;
          }

          .print-density-very-compact .print-recipe-image {
            width: 47mm !important;
            height: 27mm !important;
          }

          .print-density-very-compact .print-recipe-main {
            gap: 4mm !important;
            margin-top: 3mm !important;
          }

          .print-density-very-compact .print-recipe-block h3 {
            font-size: 12pt !important;
            margin-bottom: 1.2mm !important;
          }

          .print-density-very-compact .print-recipe-block li {
            margin-bottom: 0.55mm !important;
            line-height: 1.13 !important;
          }

          .print-density-ultra {
            font-size: 8.9pt !important;
          }

          .print-density-ultra .print-recipe-header {
            grid-template-columns: minmax(0, 1fr) 40mm !important;
            gap: 4mm !important;
            padding-bottom: 2.5mm !important;
          }

          .print-density-ultra .print-recipe-title {
            font-size: 17pt !important;
          }

          .print-density-ultra .print-recipe-meta {
            font-size: 8.8pt !important;
          }

          .print-density-ultra .print-recipe-image {
            width: 40mm !important;
            height: 23mm !important;
          }

          .print-density-ultra .print-recipe-main {
            gap: 3.5mm !important;
            margin-top: 2.5mm !important;
          }

          .print-density-ultra .print-recipe-block h3 {
            margin-bottom: 0.9mm !important;
            padding-bottom: 0.8mm !important;
            font-size: 11.2pt !important;
          }

          .print-density-ultra .print-recipe-block li {
            margin-bottom: 0.35mm !important;
            line-height: 1.09 !important;
          }

          .print-density-ultra .print-recipe-notes {
            margin-top: 1.8mm !important;
            padding: 1.6mm 2mm !important;
          }

          .print-density-ultra .print-recipe-footer {
            margin-top: 2mm !important;
            padding-top: 1.2mm !important;
            font-size: 7.5pt !important;
          }
        }
      `}</style>

      <header className="header">
        <img
          src={`${import.meta.env.BASE_URL}pwa-192x192.png`}
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
            <div
              className={`print-recipe-page ${printDensityClass(
                selectedRecipe,
              )}`}
            >
              <div className="print-recipe-header">
                <div>
                  <div className="print-recipe-brand">
                    KOCHWERK · MEINE REZEPTBOX
                  </div>

                  <h1 className="print-recipe-title">
                    {selectedRecipe.title}
                  </h1>

                  <div className="print-recipe-meta">
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

                    {categoryNameList(
                      selectedRecipe,
                    ).length > 0 && (
                      <span>
                        {categoryNameList(
                          selectedRecipe,
                        ).join(' · ')}
                      </span>
                    )}

                    {collectionNameList(
                      selectedRecipe,
                    ).length > 0 && (
                      <span>
                        Sammlung:{' '}
                        {collectionNameList(
                          selectedRecipe,
                        ).join(' · ')}
                      </span>
                    )}

                    {selectedRecipe.favorite && (
                      <span>
                        ⭐ Favorit
                      </span>
                    )}
                  </div>
                </div>

                {selectedRecipe.sourceImageUrl && (
                  <img
                    className="print-recipe-image"
                    src={
                      selectedRecipe.sourceImageUrl
                    }
                    alt=""
                  />
                )}
              </div>

              <div className="print-recipe-main">
                <div className="print-recipe-block">
                  <h3>Zutaten</h3>

                  {printableIngredients(
                    selectedRecipe,
                  ).length > 0 ? (
                    <ul>
                      {printableIngredients(
                        selectedRecipe,
                      ).map(
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

                <div className="print-recipe-block">
                  <h3>Zubereitung</h3>

                  {printablePreparation(
                    selectedRecipe,
                  ).length > 0 ? (
                    <ol>
                      {printablePreparation(
                        selectedRecipe,
                      ).map(
                        (
                          step,
                          index,
                        ) => (
                          <li key={index}>
                            {step}
                          </li>
                        ),
                      )}
                    </ol>
                  ) : (
                    <p>Keine Zubereitung gespeichert.</p>
                  )}
                </div>
              </div>

              {printableNotes(
                selectedRecipe,
              ) && (
                <div className="print-recipe-notes">
                  <h3>Notizen / Tipps</h3>

                  <p>
                    {printableNotes(
                      selectedRecipe,
                    )}
                  </p>
                </div>
              )}

              <div className="print-recipe-footer">
                <span>
                  Kochwerk – meine Rezeptbox
                </span>

                <span>
                  {printSourceLabel(
                    selectedRecipe,
                  )
                    ? `Quelle: ${printSourceLabel(
                        selectedRecipe,
                      )}`
                    : ''}
                </span>
              </div>
            </div>

            <div className="recipe-detail-toolbar">
              <button
                className="back-button"
                type="button"
                onClick={() =>
                  setSelectedRecipe(
                    null,
                  )
                }
              >
                ← Zurück
              </button>

              <div className="recipe-actions">
                <button
                  className="edit-button"
                  type="button"
                  onClick={
                    printCurrentRecipe
                  }
                >
                  🖨️ Drucken / PDF
                </button>

                <button
                  className="favorite-button"
                  type="button"
                  onClick={
                    toggleFavorite
                  }
                >
                  {selectedRecipe.favorite
                    ? '❤️ Favorit'
                    : '🤍 Favorit'}
                </button>

                <button
                  className="edit-button"
                  type="button"
                  onClick={
                    openEdit
                  }
                >
                  ✏️ Bearbeiten
                </button>

                <button
                  className="delete-button"
                  type="button"
                  onClick={
                    deleteRecipe
                  }
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
              {
                selectedRecipe.title
              }
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
              <h3>
                Zubereitung
              </h3>

              {(
                selectedRecipe.preparation ??
                []
              ).length > 0 ? (
                <ol>
                  {(
                    selectedRecipe.preparation ??
                    []
                  ).map(
                    (
                      step,
                      index,
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
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

            {selectedRecipe.description && (
              <div className="recipe-detail-section">
                <h3>
                  Notizen
                </h3>

                <p
                  style={{
                    whiteSpace:
                      'pre-wrap',
                  }}
                >
                  {
                    selectedRecipe.description
                  }
                </p>
              </div>
            )}

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

            <div
              style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop:
                  '1px solid #e5ded5',
              }}
            >
              <button
                className="back-button"
                type="button"
                onClick={() => {
                  setSelectedRecipe(
                    null,
                  )

                  requestAnimationFrame(
                    () =>
                      window.scrollTo({
                        top: 0,
                        behavior:
                          'smooth',
                      }),
                  )
                }}
                style={{
                  width: '100%',
                }}
              >
                ← Zurück
              </button>
            </div>
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
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    startSearch()
                  }
                }}
                placeholder="Rezepte und Zutaten durchsuchen …"
              />

              <button
                className="primary"
                type="button"
                onClick={
                  startSearch
                }
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
                  setView(
                    'recipes',
                  )
                }
              >
                <span className="icon">
                  📖
                </span>

                <strong>
                  Rezepte
                </strong>

                <span>
                  {recipes.length}{' '}
                  {recipes.length === 1
                    ? 'Rezept'
                    : 'Rezepte'}
                </span>
              </button>

              <button
                className="card"
                type="button"
                onClick={() =>
                  setView(
                    'categories',
                  )
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
                  setView(
                    'collections',
                  )
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
                  setView(
                    'favorites',
                  )
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
                onClick={
                  openNewRecipe
                }
              >
                ＋ Neues Rezept
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setImportMode('link')
                  setImportUrl('')
                  setFacebookText('')
                  setImportMessage('')
                  setRecipePreview(
                    null,
                  )
                  setImportNotes('')
                  setImportImageUrl('')
                  setImportCategoryIds([])
                  setImportCollectionIds([])
                  setImportFavorite(false)
                  setSaveStatus(
                    'idle',
                  )
                  setShowImport(
                    true,
                  )
                }}
              >
                ⇩ Rezept importieren
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setBackupMessage(
                    '',
                  )
                  setShowBackup(
                    true,
                  )
                }}
              >
                💾 Sicherung
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setNasMessage('')
                  setShowNasSync(true)
                }}
              >
                ☁️ NAS-Sync
              </button>

              <div
                style={{
                  gridColumn:
                    '1 / -1',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color:
                    nasSyncStatus ===
                    'conflict'
                      ? '#a33c31'
                      : nasSyncStatus ===
                          'error'
                        ? '#a33c31'
                        : '#5d654d',
                  marginTop: '2px',
                }}
              >
                {nasSyncStatus ===
                'syncing'
                  ? '☁️ Synchronisiere …'
                  : nasSyncStatus ===
                      'synced'
                    ? '☁️ Synchronisiert'
                    : nasSyncStatus ===
                        'conflict'
                      ? '⚠️ Sync-Konflikt – bitte NAS-Sync öffnen'
                      : nasSyncStatus ===
                          'error'
                        ? '⚠️ NAS momentan nicht erreichbar'
                        : '☁️ NAS-Sync noch nicht eingerichtet'}
              </div>
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
                  {searchResults.length === 1
                    ? 'Treffer'
                    : 'Treffer'}
                  {searchQuery.trim()
                    ? ` für „${searchQuery.trim()}“`
                    : ''}
                </p>
              </div>
            </div>

            <section
              className="welcome"
              style={{
                marginBottom:
                  '26px',
              }}
            >
              <input
                className="search"
                type="search"
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    startSearch()
                  }
                }}
                placeholder="Neue Suche …"
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  Kategorie

                  <select
                    value={searchCategoryId}
                    onChange={(event) => {
                      const value =
                        event.target.value

                      setSearchCategoryId(
                        value === 'all'
                          ? 'all'
                          : Number(value),
                      )
                    }}
                  >
                    <option value="all">
                      Alle Kategorien
                    </option>

                    {categories.map(
                      (category) =>
                        category.id ? (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {categoryDisplay(
                              category,
                            )}
                          </option>
                        ) : null,
                    )}
                  </select>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  Sammlung

                  <select
                    value={searchCollectionId}
                    onChange={(event) => {
                      const value =
                        event.target.value

                      setSearchCollectionId(
                        value === 'all'
                          ? 'all'
                          : Number(value),
                      )
                    }}
                  >
                    <option value="all">
                      Alle Sammlungen
                    </option>

                    {collections.map(
                      (collection) =>
                        collection.id ? (
                          <option
                            key={collection.id}
                            value={collection.id}
                          >
                            🗃️ {collection.name}
                          </option>
                        ) : null,
                    )}
                  </select>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  Sortierung

                  <select
                    value={searchSort}
                    onChange={(event) =>
                      setSearchSort(
                        event.target.value as
                          | 'az'
                          | 'updated',
                      )
                    }
                  >
                    <option value="az">
                      A–Z
                    </option>
                    <option value="updated">
                      Zuletzt geändert
                    </option>
                  </select>
                </label>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  marginTop: '16px',
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={searchFavoritesOnly}
                  onChange={(event) =>
                    setSearchFavoritesOnly(
                      event.target.checked,
                    )
                  }
                  style={{
                    width: 'auto',
                    margin: 0,
                  }}
                />

                ❤️ Nur Favoriten
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >
                <button
                  className="primary"
                  type="button"
                  onClick={startSearch}
                  disabled={
                    !searchQuery.trim() &&
                    searchCategoryId === 'all' &&
                    searchCollectionId === 'all' &&
                    !searchFavoritesOnly
                  }
                >
                  🔎 Anwenden
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={resetSearchFilters}
                >
                  ↺ Zurücksetzen
                </button>
              </div>
            </section>

            {renderRecipeGrid(
              searchResults,
            )}
          </section>
        ) : view === 'categories' ? (
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
                  {
                    categories.length
                  }{' '}
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
                marginBottom:
                  '24px',
              }}
            >
              ＋ Neue Kategorie
            </button>

            {categories.length ===
            0 ? (
              <div className="empty-recipes">
                Noch keine Kategorien vorhanden.
              </div>
            ) : (
              <div className="recipe-grid">
                {categories.map(
                  (category) => {
                    const count =
                      category.id
                        ? recipes.filter(
                            (
                              recipe,
                            ) =>
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
                        style={{
                          width:
                            '320px',
                          minWidth:
                            '320px',
                          maxWidth:
                            '320px',
                          overflow:
                            'visible',
                        }}
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
                          <div
                            className="recipe-card-placeholder"
                            style={{
                              minHeight:
                                '86px',
                              height:
                                '86px',
                              fontSize:
                                '2.15rem',
                            }}
                          >
                            {category.icon ||
                              '—'}
                          </div>

                          <div
                            className="recipe-card-content"
                            style={{
                              padding:
                                '14px 16px 12px',
                            }}
                          >
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
                              'grid',
                            gridTemplateColumns:
                              '1fr 1fr',
                            gap:
                              '12px',
                            padding:
                              '0 14px 14px',
                            width:
                              '100%',
                            boxSizing:
                              'border-box',
                            overflow:
                              'visible',
                          }}
                        >
                          <button
                            className="edit-button"
                            type="button"
                            style={{
                              width:
                                '100%',
                              minWidth:
                                '0',
                              whiteSpace:
                                'nowrap',
                              padding:
                                '10px 12px',
                              textAlign:
                                'center',
                              boxSizing:
                                'border-box',
                              overflow:
                                'visible',
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
                              width:
                                '100%',
                              minWidth:
                                '0',
                              whiteSpace:
                                'nowrap',
                              padding:
                                '10px 12px',
                              textAlign:
                                'center',
                              boxSizing:
                                'border-box',
                              overflow:
                                'visible',
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
        ) : view === 'collections' ? (
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
                  {
                    collections.length
                  }{' '}
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
                marginBottom:
                  '24px',
              }}
            >
              ＋ Neue Sammlung
            </button>

            {collections.length ===
            0 ? (
              <div className="empty-recipes">
                Noch keine Sammlungen vorhanden.
              </div>
            ) : (
              <div className="recipe-grid">
                {collections.map(
                  (collection) => {
                    const count =
                      collection.id
                        ? recipes.filter(
                            (
                              recipe,
                            ) =>
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
                        style={{
                          width:
                            '320px',
                          minWidth:
                            '320px',
                          maxWidth:
                            '320px',
                          overflow:
                            'visible',
                        }}
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
                          <div
                            className="recipe-card-placeholder"
                            style={{
                              minHeight:
                                '86px',
                              height:
                                '86px',
                              fontSize:
                                '2.05rem',
                            }}
                          >
                            🗃️
                          </div>

                          <div
                            className="recipe-card-content"
                            style={{
                              padding:
                                '14px 16px 12px',
                            }}
                          >
                            <h3>
                              {
                                collection.name
                              }
                            </h3>

                            {collection.description?.trim() && (
                              <p
                                style={{
                                  margin:
                                    '4px 0',
                                  color:
                                    '#777168',
                                  fontSize:
                                    '0.88rem',
                                  lineHeight:
                                    1.25,
                                  display:
                                    '-webkit-box',
                                  WebkitLineClamp:
                                    2,
                                  WebkitBoxOrient:
                                    'vertical',
                                  overflow:
                                    'hidden',
                                }}
                                title={
                                  collection.description
                                }
                              >
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
                              'grid',
                            gridTemplateColumns:
                              '1fr 1fr',
                            gap:
                              '12px',
                            padding:
                              '0 14px 14px',
                            width:
                              '100%',
                            boxSizing:
                              'border-box',
                            overflow:
                              'visible',
                          }}
                        >
                          <button
                            className="edit-button"
                            type="button"
                            style={{
                              width:
                                '100%',
                              minWidth:
                                '0',
                              whiteSpace:
                                'nowrap',
                              padding:
                                '10px 12px',
                              textAlign:
                                'center',
                              boxSizing:
                                'border-box',
                              overflow:
                                'visible',
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
                              width:
                                '100%',
                              minWidth:
                                '0',
                              whiteSpace:
                                'nowrap',
                              padding:
                                '10px 12px',
                              textAlign:
                                'center',
                              boxSizing:
                                'border-box',
                              overflow:
                                'visible',
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
        ) : view === 'categoryRecipes' ? (
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
        ) : view === 'collectionRecipes' ? (
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

            <div
              style={{
                marginTop: '28px',
                paddingTop: '18px',
                borderTop:
                  '1px solid #e5ded5',
              }}
            >
              <button
                className="back-button"
                type="button"
                onClick={() => {
                  setView('home')

                  requestAnimationFrame(
                    () =>
                      window.scrollTo({
                        top: 0,
                        behavior:
                          'smooth',
                      }),
                  )
                }}
                style={{
                  width: '100%',
                }}
              >
                ← Zurück
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>
        Kochwerk · Version {APP_VERSION}
      </footer>

      {showNasSync && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNasSync(false)
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
                setShowNasSync(false)
              }
            >
              ×
            </button>

            <h2>
              ☁️ NAS-Synchronisation
            </h2>

            <p
              style={{
                color: '#706a62',
                lineHeight: 1.5,
              }}
            >
              Zuerst prüfen wir nur die Verbindung zum NAS.
              Es werden dabei noch keine Rezepte übertragen oder verändert.
            </p>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#faf8f5',
                textAlign: 'center',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              {nasSyncStatus ===
              'synced'
                ? '☁️ Synchronisiert'
                : nasSyncStatus ===
                    'syncing'
                  ? '☁️ Synchronisierung läuft …'
                  : nasSyncStatus ===
                      'conflict'
                    ? '⚠️ Konflikt erkannt – nichts wurde überschrieben'
                    : nasSyncStatus ===
                        'error'
                      ? '⚠️ NAS momentan nicht erreichbar'
                      : '☁️ Automatischer Sync noch nicht eingerichtet'}

              {nasLastSyncAt && (
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#706a62',
                  }}
                >
                  Zuletzt synchronisiert:{' '}
                  {new Date(
                    nasLastSyncAt,
                  ).toLocaleString()}
                </div>
              )}
            </div>

            <button
              className="secondary"
              type="button"
              onClick={runNasSyncNow}
              disabled={
                nasSyncStatus ===
                'syncing'
              }
              style={{
                width: '100%',
                marginTop: '4px',
              }}
            >
              {nasSyncStatus ===
              'syncing'
                ? '☁️ Synchronisiere …'
                : '🔄 Jetzt synchronisieren'}
            </button>

            <details
              style={{
                marginTop: '16px',
                border:
                  '1px solid #e5ded5',
                borderRadius: '12px',
                padding: '10px 12px',
                background: '#fff',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                ⚙️ NAS-Einstellungen & Diagnose
              </summary>

              <div
                style={{
                  marginTop: '14px',
                }}
              >
                <label>
                  NAS-API-Adresse

                  <input
                    type="url"
                    value={nasUrl}
                    onChange={(event) => {
                      setNasUrl(
                        event.target.value,
                      )
                      setNasMessage('')
                    }}
                    placeholder="https://.../kochwerk.php"
                  />
                </label>

                <label>
                  Kochwerk-Schlüssel

                  <input
                    type="password"
                    value={nasKey}
                    onChange={(event) => {
                      setNasKey(
                        event.target.value,
                      )
                      setNasMessage('')
                    }}
                    placeholder="Schlüssel aus kochwerk-config.php"
                    autoComplete="off"
                  />
                </label>

                <p
                  style={{
                    marginTop: '8px',
                    color: '#706a62',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                  }}
                >
                  Der Schlüssel wird nur in diesem Browser auf diesem Gerät gespeichert
                  und nicht in GitHub eingebaut.
                </p>

                <button
                  className="secondary"
                  type="button"
                  onClick={saveNasSettings}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                  }}
                >
                  💾 Einstellungen speichern
                </button>

                <button
                  className="save-recipe-button"
                  type="button"
                  onClick={testNasConnection}
                  disabled={nasTesting}
                >
                  {nasTesting
                    ? 'Verbindung wird geprüft …'
                    : '🔌 NAS-Verbindung testen'}
                </button>

                <button
                  className="save-recipe-button"
                  type="button"
                  onClick={uploadCurrentDataToNas}
                  disabled={
                    nasUploading ||
                    nasTesting ||
                    nasDataExists
                  }
                  style={{
                    marginTop: '10px',
                  }}
                >
                  {nasUploading
                    ? 'Daten werden übertragen …'
                    : nasDataExists
                      ? '✓ NAS enthält bereits Kochwerk-Daten'
                      : '⬆️ Ersten Stand auf NAS übertragen'}
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={checkNasDataWithoutImport}
                  disabled={
                    nasPullChecking ||
                    nasTesting ||
                    nasUploading
                  }
                  style={{
                    width: '100%',
                    marginTop: '10px',
                  }}
                >
                  {nasPullChecking
                    ? 'NAS-Stand wird gelesen …'
                    : '🔎 NAS-Stand prüfen'}
                </button>

                {nasPreview && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '14px',
                      border:
                        '1px solid #e5ded5',
                      borderRadius: '12px',
                      background: '#faf8f5',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>
                      NAS-Inhalt
                    </strong>

                    <div>
                      {nasPreview.recipeCount}{' '}
                      Rezepte
                    </div>

                    <div>
                      {nasPreview.categoryCount}{' '}
                      Kategorien
                    </div>

                    <div>
                      {nasPreview.collectionCount}{' '}
                      Sammlungen
                    </div>

                    {nasPreview.updatedAt && (
                      <div
                        style={{
                          marginTop: '6px',
                          color: '#706a62',
                          fontSize: '0.9rem',
                        }}
                      >
                        NAS zuletzt gespeichert:{' '}
                        {new Date(
                          nasPreview.updatedAt,
                        ).toLocaleString()}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: '8px',
                        fontWeight: 700,
                      }}
                    >
                      Nur geprüft – lokal nichts verändert.
                    </div>
                  </div>
                )}

                {nasPulledData && (
                  <button
                    className="save-recipe-button"
                    type="button"
                    onClick={
                      applyNasDataToThisDevice
                    }
                    disabled={
                      nasApplying ||
                      nasPullChecking ||
                      nasTesting ||
                      nasUploading
                    }
                    style={{
                      marginTop: '12px',
                    }}
                  >
                    {nasApplying
                      ? 'NAS-Stand wird übernommen …'
                      : '⬇️ NAS-Stand auf dieses Gerät übernehmen'}
                  </button>
                )}
              </div>
            </details>

            {nasMessage && (
              <p
                className="import-message"
                style={{
                  marginTop: '18px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {nasMessage}
              </p>
            )}

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowNasSync(false)
              }
              style={{
                width: '100%',
                marginTop: '12px',
              }}
            >
              × Schließen
            </button>
          </div>
        </div>
      )}

      {showBackup && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowBackup(false)
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
                setShowBackup(false)
              }
            >
              ×
            </button>

            <h2>
              💾 Sicherung
            </h2>

            <p
              style={{
                color: '#706a62',
                lineHeight: 1.5,
              }}
            >
              Sichere deine komplette
              Kochwerk-Rezeptbox als Datei.
              Enthalten sind Rezepte,
              Kategorien und Sammlungen.
            </p>

            <button
              className="save-recipe-button"
              type="button"
              onClick={createBackup}
            >
              💾 Sicherung erstellen
            </button>

            <div
              style={{
                marginTop: '30px',
                paddingTop: '24px',
                borderTop:
                  '1px solid #e5ded5',
              }}
            >
              <h3>
                Sicherung wiederherstellen
              </h3>

              <p
                style={{
                  color: '#706a62',
                  lineHeight: 1.5,
                }}
              >
                Wähle zuerst, wie die Sicherung eingelesen werden soll.
              </p>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginTop: '14px',
                  fontWeight: 700,
                }}
              >
                <input
                  type="radio"
                  name="backupRestoreMode"
                  checked={backupRestoreMode === 'merge'}
                  onChange={() =>
                    setBackupRestoreMode('merge')
                  }
                  style={{
                    width: 'auto',
                    marginTop: '3px',
                  }}
                />

                <span>
                  Zusammenführen (empfohlen)
                  <small
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      color: '#706a62',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    Vorhandene Rezepte bleiben erhalten. Fehlende werden ergänzt und doppelte übersprungen.
                  </small>
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginTop: '14px',
                  fontWeight: 700,
                }}
              >
                <input
                  type="radio"
                  name="backupRestoreMode"
                  checked={backupRestoreMode === 'replace'}
                  onChange={() =>
                    setBackupRestoreMode('replace')
                  }
                  style={{
                    width: 'auto',
                    marginTop: '3px',
                  }}
                />

                <span>
                  Komplett ersetzen
                  <small
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      color: '#a33c31',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    Achtung: Der aktuelle Inhalt wird vollständig durch die Sicherung ersetzt.
                  </small>
                </span>
              </label>

              <input
                type="file"
                accept=".json,application/json"
                onChange={
                  restoreBackup
                }
                style={{
                  marginTop: '18px',
                }}
              />
            </div>

            {backupMessage && (
              <p
                className="import-message"
                style={{
                  marginTop: '22px',
                }}
              >
                {backupMessage}
              </p>
            )}

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowBackup(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
            </button>
          </div>
        </div>
      )}

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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              <button
                className={
                  importMode === 'link'
                    ? 'primary'
                    : 'secondary'
                }
                type="button"
                onClick={() => {
                  setImportMode('link')
                  setImportMessage('')
                  setRecipePreview(null)
                  setImportNotes('')
                  setImportImageUrl('')
                  setSaveStatus('idle')
                }}
              >
                🔗 Link
              </button>

              <button
                className={
                  importMode === 'facebookText'
                    ? 'primary'
                    : 'secondary'
                }
                type="button"
                onClick={() => {
                  setImportMode(
                    'facebookText',
                  )
                  setImportMessage('')
                  setRecipePreview(null)
                  setImportNotes('')
                  setImportImageUrl('')
                  setSaveStatus('idle')
                }}
              >
                Facebook-Hilfe
              </button>
            </div>

            {importMode === 'link' ? (
              <>
                <p>
                  Füge einen Rezept-Link ein.
                  Kochwerk erkennt normale
                  Webseiten und Facebook-Links
                  automatisch.
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
                    setImportCategoryIds([])
                    setImportCollectionIds([])
                    setImportFavorite(false)
                    setSaveStatus('idle')
                  }}
                  placeholder="https://..."
                />

                <button
                  className="secondary"
                  type="button"
                  onClick={
                    pasteImportUrlFromClipboard
                  }
                  style={{
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  📋 Link aus Zwischenablage einfügen
                </button>

                <button
                  className="import-button"
                  type="button"
                  disabled={
                    !importUrl.trim() ||
                    importLoading
                  }
                  onClick={
                    handleImport
                  }
                >
                  {importLoading
                    ? 'Rezept wird eingelesen …'
                    : 'Rezept einlesen'}
                </button>
              </>
            ) : (
              <>
                <p>
                  Wenn Facebook den direkten
                  Linkimport blockiert, kopiere
                  nur den Beitragstext oder die
                  Beschreibung. Der ursprüngliche
                  Facebook-Link bleibt automatisch
                  als Quelle erhalten.
                </p>

                <textarea
                  value={facebookText}
                  onChange={(event) => {
                    setFacebookText(
                      event.target.value,
                    )
                    setImportMessage('')
                    setRecipePreview(null)
                    setImportCategoryIds([])
                    setImportCollectionIds([])
                    setImportFavorite(false)
                    setSaveStatus('idle')
                  }}
                  rows={12}
                  placeholder={
                    'Rezeptname\n\nZutaten:\n...\n\nZubereitung:\n...'
                  }
                  style={{
                    width: '100%',
                  }}
                />

                <button
                  className="secondary"
                  type="button"
                  onClick={
                    pasteFacebookTextFromClipboard
                  }
                  style={{
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  📋 Facebook-Text aus Zwischenablage einfügen
                </button>

                <div
                  onDrop={
                    handleFacebookImageDrop
                  }
                  onDragOver={
                    handleFacebookImageDragOver
                  }
                  style={{
                    marginTop: '18px',
                    padding: '16px',
                    border:
                      '2px dashed #b9b09f',
                    borderRadius: '14px',
                    background: '#faf8f5',
                    textAlign: 'center',
                    cursor: 'copy',
                  }}
                  title="Bild aus Firefox hierher ziehen"
                >
                  <strong>
                    🖼️ Bild zum Rezept
                  </strong>

                  <p
                    style={{
                      margin:
                        '8px 0 12px',
                      color: '#706a62',
                      lineHeight: 1.4,
                    }}
                  >
                    Bild direkt aus Firefox hierher ziehen – oder unten auswählen.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleFacebookImageFile
                    }
                  />

                  <button
                    className="secondary"
                    type="button"
                    onClick={
                      pasteFacebookImageFromClipboard
                    }
                    style={{
                      width: '100%',
                      marginTop: '10px',
                    }}
                  >
                    📋 Bild aus Zwischenablage übernehmen
                  </button>

                  {importImageUrl && (
                    <div
                      style={{
                        marginTop:
                          '12px',
                      }}
                    >
                      <img
                        src={
                          importImageUrl
                        }
                        alt="Facebook-Rezept"
                        style={{
                          width: '100%',
                          maxHeight:
                            '260px',
                          objectFit:
                            'cover',
                          borderRadius:
                            '12px',
                        }}
                      />

                      <button
                        className="delete-button"
                        type="button"
                        onClick={() =>
                          setImportImageUrl(
                            '',
                          )
                        }
                        style={{
                          marginTop:
                            '8px',
                        }}
                      >
                        🗑️ Bild entfernen
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="import-button"
                  type="button"
                  disabled={
                    !facebookText.trim() ||
                    importLoading
                  }
                  onClick={
                    handleFacebookTextImport
                  }
                >
                  {importLoading
                    ? 'Facebook-Text wird ausgewertet …'
                    : 'Facebook-Rezept auswerten'}
                </button>
              </>
            )}

            {importMessage && (
              <p className="import-message">
                {importMessage}
              </p>
            )}

            {recipePreview && (
              <div className="recipe-preview">
                {(importImageUrl ||
                  recipePreview.image) && (
                  <img
                    src={
                      importImageUrl ||
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

                <h4>
                  Zutaten
                </h4>

                <ul>
                  {recipePreview.ingredients.map(
                    (
                      ingredient,
                      index,
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
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
                      <li
                        key={
                          index
                        }
                      >
                        {
                          instruction
                        }
                      </li>
                    ),
                  )}
                </ol>

                {importNotes && (
                  <>
                    <h4>
                      Tipp / Hinweis
                    </h4>

                    <p
                      style={{
                        whiteSpace:
                          'pre-wrap',
                      }}
                    >
                      {importNotes}
                    </p>
                  </>
                )}

                <div
                  style={{
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop:
                      '1px solid #e5ded5',
                  }}
                >
                  <h4>
                    Zuordnung vor dem Speichern
                  </h4>

                  <label>
                    Kategorien

                    {renderCategoryChoices(
                      importCategoryIds,
                      toggleImportCategory,
                    )}
                  </label>

                  <label>
                    Sammlungen

                    {renderCollectionChoices(
                      importCollectionIds,
                      toggleImportCollection,
                    )}
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '18px',
                      fontWeight: 700,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={importFavorite}
                      onChange={(event) =>
                        setImportFavorite(
                          event.target.checked,
                        )
                      }
                      style={{
                        width: 'auto',
                        margin: 0,
                      }}
                    />

                    <span>
                      ❤️ Als Favorit speichern
                    </span>
                  </label>
                </div>

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

            <div
              style={{
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid #e5ded5',
              }}
            >
              <button
                className="back-button"
                type="button"
                onClick={() =>
                  setShowImport(false)
                }
                style={{
                  width: '100%',
                }}
              >
                × Schließen
              </button>
            </div>
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
                value={
                  newServings
                }
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
              Zutaten – eine Zeile pro Zutat

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
              Zubereitung – ein Schritt pro Zeile

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

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowNewRecipe(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
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
              style={{
                maxHeight: '92vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
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

              <h2
                style={{
                  marginBottom: '14px',
                  flexShrink: 0,
                }}
              >
                Rezept bearbeiten
              </h2>

              <div
                style={{
                  overflowY: 'auto',
                  paddingRight: '4px',
                  marginRight: '-4px',
                }}
              >
                <section
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e7ded4',
                    borderRadius: '16px',
                    background: '#faf8f5',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 14px',
                      fontSize: '1rem',
                    }}
                  >
                    Grunddaten
                  </h3>

                  <label>
                    Titel

                    <input
                      value={
                        editTitle
                      }
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
                      value={
                        editTime
                      }
                      onChange={(event) =>
                        setEditTime(
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '16px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editFavorite}
                      onChange={(event) =>
                        setEditFavorite(
                          event.target.checked,
                        )
                      }
                      style={{
                        width: 'auto',
                        margin: 0,
                      }}
                    />

                    <span>
                      Als Favorit markieren
                    </span>
                  </label>
                </section>

                <section
                  onDrop={
                    handleEditImageDrop
                  }
                  onDragOver={
                    handleEditImageDragOver
                  }
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '2px dashed #b9b09f',
                    borderRadius: '16px',
                    background: '#faf8f5',
                    cursor: 'copy',
                  }}
                  title="Bild aus Firefox hierher ziehen"
                >
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: '1rem',
                    }}
                  >
                    🖼️ Bild
                  </h3>

                  <p
                    style={{
                      margin: '0 0 14px',
                      color: '#706a62',
                      lineHeight: 1.4,
                    }}
                  >
                    Bild direkt aus Firefox in diesen Bereich ziehen – oder unten auswählen.
                  </p>

                  <label>
                    Bild vom Gerät auswählen

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleEditImageFile
                      }
                    />
                  </label>

                  <label>
                    Bild-Link

                    <input
                      type="url"
                      value={
                        editImageUrl
                      }
                      onChange={(event) =>
                        setEditImageUrl(
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>

                  {editImageUrl && (
                    <div
                      style={{
                        marginTop: '10px',
                      }}
                    >
                      <img
                        src={editImageUrl}
                        alt="Vorschau"
                        style={{
                          width: '100%',
                          maxHeight: '240px',
                          objectFit: 'cover',
                          borderRadius: '14px',
                        }}
                      />

                      <button
                        className="delete-button"
                        type="button"
                        style={{
                          marginTop: '10px',
                        }}
                        onClick={() =>
                          setEditImageUrl('')
                        }
                      >
                        🗑️ Bild entfernen
                      </button>
                    </div>
                  )}
                </section>

                <section
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e7ded4',
                    borderRadius: '16px',
                    background: '#faf8f5',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 14px',
                      fontSize: '1rem',
                    }}
                  >
                    Zuordnung
                  </h3>

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
                </section>

                <section
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #e7ded4',
                    borderRadius: '16px',
                    background: '#faf8f5',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 14px',
                      fontSize: '1rem',
                    }}
                  >
                    Rezeptinhalt
                  </h3>

                  <label>
                    Zutaten – eine Zeile pro Zutat

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
                    Zubereitung – ein Schritt pro Zeile

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
                </section>

                <section
                  style={{
                    padding: '16px',
                    marginBottom: '8px',
                    border: '1px solid #e7ded4',
                    borderRadius: '16px',
                    background: '#faf8f5',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 14px',
                      fontSize: '1rem',
                    }}
                  >
                    Quelle & Notizen
                  </h3>

                  <label>
                    Eigene Notizen

                    <textarea
                      value={editNotes}
                      onChange={(event) =>
                        setEditNotes(
                          event.target.value,
                        )
                      }
                      rows={5}
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    Quellenname

                    <input
                      value={editSourceName}
                      onChange={(event) =>
                        setEditSourceName(
                          event.target.value,
                        )
                      }
                      placeholder="z. B. migusto.ch"
                    />
                  </label>

                  <label>
                    Original-Link

                    <input
                      type="url"
                      value={editSourceUrl}
                      onChange={(event) =>
                        setEditSourceUrl(
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>
                </section>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  paddingTop: '14px',
                  marginTop: '4px',
                  borderTop: '1px solid #e5ded5',
                  background: 'white',
                }}
              >
                <button
                  className="save-recipe-button"
                  type="button"
                  onClick={saveEdit}
                  style={{
                    marginTop: 0,
                  }}
                >
                  Änderungen speichern
                </button>

                <button
                  className="back-button"
                  type="button"
                  onClick={() =>
                    setShowEdit(false)
                  }
                  style={{
                    width: '100%',
                    marginTop: '10px',
                  }}
                >
                  ← Zurück
                </button>
              </div>
            </div>
          </div>
        )}

      {showNewCategory && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewCategory(false)
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
                setShowNewCategory(false)
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
                textAlign:
                  'center',

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

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowNewCategory(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
            </button>
          </div>
        </div>
      )}

      {showEditCategory &&
        selectedCategory && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowEditCategory(false)
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
                  setShowEditCategory(false)
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

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowEditCategory(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
            </button>
            </div>
          </div>
        )}

      {showNewCollection && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowNewCollection(false)
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
                setShowNewCollection(false)
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

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowNewCollection(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
            </button>
          </div>
        </div>
      )}

      {showEditCollection &&
        selectedCollection && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowEditCollection(false)
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
                  setShowEditCollection(false)
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

            <button
              className="back-button"
              type="button"
              onClick={() =>
                setShowEditCollection(false)
              }
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              × Schließen
            </button>
            </div>
          </div>
        )}
    </div>
  )
}

export default App