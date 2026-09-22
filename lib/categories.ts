import type { Category, SourceId } from "./types"

export const CATEGORIES: Category[] = [
	{ id: "all", label: "All", sources: ["upload", "wallhaven"] },
	{ id: "nature", label: "Nature", sources: ["upload", "wallhaven"] },
	{ id: "abstract", label: "Abstract", sources: ["upload", "wallhaven"] },
	{ id: "urban", label: "Urban", sources: ["upload", "wallhaven"] },
	{ id: "dark", label: "Dark", sources: ["upload", "wallhaven"] },
	{ id: "anime", label: "Anime", sources: ["upload", "wallhaven"] },
]

export function getCategory(id: string): Category | undefined {
	return CATEGORIES.find((c) => c.id === id)
}

export function categoryExists(id: string): boolean {
	return CATEGORIES.some((c) => c.id === id)
}

export function getPrimarySource(id: string): SourceId | undefined {
	return getCategory(id)?.sources[0]
}
