export interface ImportedRecipe {
  title: string
  ingredients: string[]
  instructions: string[]
  image?: string
  yield?: string | string[]
  prepTime?: string
  cookTime?: string
  totalTime?: string
}

export interface ImportResult {
  success: boolean
  sourceUrl: string
  sourceName?: string
  recipe?: ImportedRecipe
  error?: string
}

export function validateRecipeUrl(value: string): ImportResult {
  const trimmedUrl = value.trim()

  if (!trimmedUrl) {
    return {
      success: false,
      sourceUrl: '',
      error: 'Bitte einen Link eingeben.',
    }
  }

  try {
    const url = new URL(trimmedUrl)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        success: false,
        sourceUrl: trimmedUrl,
        error: 'Der Link muss mit http:// oder https:// beginnen.',
      }
    }

    return {
      success: true,
      sourceUrl: url.href,
      sourceName: url.hostname.replace(/^www\./, ''),
    }
  } catch {
    return {
      success: false,
      sourceUrl: trimmedUrl,
      error: 'Der eingegebene Link ist ungültig.',
    }
  }
}

const IMPORT_WORKER_URL =
  'https://kochwerk-import-worker.andy-kochwerk.workers.dev'

export async function importRecipe(
  value: string,
): Promise<ImportResult> {
  const validation = validateRecipeUrl(value)

  if (!validation.success) {
    return validation
  }

  try {
    const response = await fetch(
      `${IMPORT_WORKER_URL}/import?url=${encodeURIComponent(
        validation.sourceUrl,
      )}`,
    )

    if (!response.ok) {
      return {
        success: false,
        sourceUrl: validation.sourceUrl,
        sourceName: validation.sourceName,
        error: `Der Importdienst antwortet mit Fehler ${response.status}.`,
      }
    }

    const data = (await response.json()) as ImportResult

    return data
  } catch {
    return {
      success: false,
      sourceUrl: validation.sourceUrl,
      sourceName: validation.sourceName,
      error: 'Der Importdienst ist momentan nicht erreichbar.',
    }
  }
}