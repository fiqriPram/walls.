export type SourceId = "picsum" | "ghibli"

export interface WallpaperItem {
	id: string
	source: SourceId
	title: string
	author: string
	thumb: string
	full: string
	download: string
	width: number
	height: number
	tags: string[]
}

export interface FetchParams {
	category: string
	page: number
	limit: number
	search?: string
}

export interface FetchResult {
	items: WallpaperItem[]
	hasMore: boolean
	total?: number
}

export interface ImageSize {
	width: number
	height?: number
}

export interface Category {
	id: string
	label: string
	sources: SourceId[]
}

export interface SourceInfo {
	id: SourceId
	name: string
	categories: string[]
}
