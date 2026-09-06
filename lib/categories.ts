import type { Category, SourceId } from "./types"

export const CATEGORIES: Category[] = [
	{ id: "all", label: "All", sources: ["picsum"] },
	{ id: "nature", label: "Nature", sources: ["picsum"] },
	{ id: "abstract", label: "Abstract", sources: ["picsum"] },
	{ id: "urban", label: "Urban", sources: ["picsum"] },
	{ id: "dark", label: "Dark", sources: ["picsum"] },
	{ id: "anime", label: "Anime", sources: ["ghibli"] },
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
