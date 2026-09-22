import { db } from './database'

export type StoredRecipeImage = {
  sourceImageId: string
  sourceImageMimeType: string
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256Blob(blob: Blob) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    await blob.arrayBuffer(),
  )

  return bytesToHex(new Uint8Array(digest))
}

export async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl)

  if (!response.ok) {
    throw new Error('Das gespeicherte Bild konnte nicht gelesen werden.')
  }

  return response.blob()
}

export async function storeRecipeImageBlob(
  blob: Blob,
): Promise<StoredRecipeImage> {
  const sourceImageId = await sha256Blob(blob)
  const sourceImageMimeType = blob.type || 'image/jpeg'

  await db.recipeAssets.put({
    storageId: sourceImageId,
    blob,
    mimeType: sourceImageMimeType,
    byteSize: blob.size,
    createdAt: new Date(),
  })

  return {
    sourceImageId,
    sourceImageMimeType,
  }
}

export async function storeRecipeImageDataUrl(
  dataUrl: string,
) {
  return storeRecipeImageBlob(await dataUrlToBlob(dataUrl))
}

export async function getRecipeImageBlob(storageId: string) {
  return (await db.recipeAssets.get(storageId))?.blob ?? null
}

export async function hasRecipeImage(storageId: string) {
  return Boolean(await db.recipeAssets.get(storageId))
}

export async function fetchRecipeImageFromNas(storageId: string) {
  const nasUrl = window.localStorage.getItem('kochwerkNasUrl')?.trim()
  const nasKey = window.localStorage.getItem('kochwerkNasKey')?.trim()

  if (!nasUrl || !nasKey) return null

  const separator = nasUrl.includes('?') ? '&' : '?'
  const response = await fetch(
    `${nasUrl}${separator}action=image&id=${encodeURIComponent(storageId)}`,
    {
      method: 'GET',
      headers: {
        'X-Kochwerk-Key': nasKey,
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) return null

  const blob = await response.blob()
  const stored = await storeRecipeImageBlob(blob)

  if (stored.sourceImageId !== storageId) {
    await db.recipeAssets.delete(stored.sourceImageId)
    throw new Error('Das NAS lieferte nicht das erwartete Rezeptbild.')
  }

  return blob
}

export async function resolveRecipeImageBlob(storageId: string) {
  return (
    await getRecipeImageBlob(storageId) ??
    await fetchRecipeImageFromNas(storageId)
  )
}
