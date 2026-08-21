import Dexie, { type Table } from 'dexie'

export interface Ingredient {
  id: string
  amount?: string
  unit?: string
  name: string
  note?: string
}

export interface Recipe {
  id?: number

  title: string
  description?: string

  categoryIds: number[]
  collectionIds: number[]

  ingredients: Ingredient[]
  preparation: string[]

  servings?: number
  servingsLabel?: string

  prepTimeMinutes?: number
  cookingTimeMinutes?: number
  totalTimeMinutes?: number

  notes?: string

  sourceUrl?: string
  sourceName?: string
  videoUrl?: string

  imageIds: number[]

  favorite: boolean

  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  name: string
  icon?: string
  sortOrder: number
}

export interface Collection {
  id?: number
  name: string
  description?: string
  sortOrder: number
}

export interface RecipeImage {
  id?: number
  recipeId?: number
  blob: Blob
  fileName?: string
  mimeType?: string
  createdAt: Date
}

export class KochwerkDatabase extends Dexie {
  recipes!: Table<Recipe, number>
  categories!: Table<Category, number>
  collections!: Table<Collection, number>
  images!: Table<RecipeImage, number>

  constructor() {
    super('kochwerkDB')

    this.version(2).stores({
      recipes:
        '++id, title, favorite, *categoryIds, *collectionIds, createdAt, updatedAt',
      categories: '++id, name, sortOrder',
      collections: '++id, name, sortOrder',
      images: '++id, recipeId, createdAt',
    })
  }
}

export const db = new KochwerkDatabase()