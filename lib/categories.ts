import type { Category, SourceId } from "./types"

export const CATEGORIES: Category[] = [
	{ id: "all", label: "All", sources: ["upload"] },
	{ id: "nature", label: "Nature", sources: ["upload"] },
	{ id: "abstract", label: "Abstract", sources: ["upload"] },
	{ id: "urban", label: "Urban", sources: ["upload"] },
	{ id: "dark", label: "Dark", sources: ["upload"] },
	{ id: "anime", label: "Anime", sources: ["upload"] },
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
