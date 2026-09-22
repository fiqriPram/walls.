import type { FetchParams, FetchResult, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface WallhavenTag {
	id: number
	name: string
}

interface WallhavenWallpaper {
	id: string
	purity: string
	category: string
	resolution: string
	ratio: string
	path: string
	created_at: string
	tags: WallhavenTag[]
	uploader?: { username: string }
	thumbs: { large: string; original: string; small: string }
	dimension_x: number
	dimension_y: number
}

interface WallhavenSearchResponse {
	data: WallhavenWallpaper[]
	meta: { current_page: number; last_page: number; per_page: number; total: number }
}

const CATEGORY_QUERY: Record<string, { q?: string; categories?: string; sorting?: string }> = {
	all: { sorting: "toplist" },
	nature: { q: "nature landscape", sorting: "relevance" },
	abstract: { q: "abstract", sorting: "relevance" },
	urban: { q: "city night", sorting: "relevance" },
	dark: { q: "dark", sorting: "relevance" },
	anime: { categories: "010", sorting: "toplist" },
}

/**
 * Wallhaven (wallhaven.cc) — free, no API key needed for SFW.
 * Optional WALLHAVEN_API_KEY env raises the rate limit.
 * Docs: https://wallhaven.cc/help/api
 */
export class WallhavenSource extends BaseSource {
	readonly id = "wallhaven" as const
	readonly name = "Wallhaven"
	readonly categories = ["all", "nature", "abstract", "urban", "dark", "anime"]

	async fetch(params: FetchParams): Promise<FetchResult> {
		const conf = CATEGORY_QUERY[params.category] ?? CATEGORY_QUERY.all
		const url = new URL("https://wallhaven.cc/api/v1/search")
		if (params.search) {
			url.searchParams.set("q", params.search)
		} else if (conf.q) {
			url.searchParams.set("q", conf.q)
		}
		url.searchParams.set("categories", conf.categories ?? "111")
		url.searchParams.set("purity", "100") // SFW only
		url.searchParams.set("sorting", params.search ? "relevance" : (conf.sorting ?? "toplist"))
		url.searchParams.set("order", "desc")
		url.searchParams.set("atleast", "1920x1080")
		url.searchParams.set("page", String(params.page))

		const apiKey = process.env.WALLHAVEN_API_KEY
		if (apiKey) url.searchParams.set("apikey", apiKey)

		const data = await this.getJson<WallhavenSearchResponse>(url.toString())
		const items: WallpaperItem[] = (data.data ?? []).map((w) => ({
			id: `wallhaven-${w.id}`,
			source: "wallhaven",
			title: w.tags?.[0]?.name ?? `${w.category} ${w.id}`,
			author: w.uploader?.username ?? "wallhaven",
			thumb: w.thumbs.small,
			full: w.path,
			download: w.path,
			width: w.dimension_x,
			height: w.dimension_y,
			tags: (w.tags ?? []).slice(0, 8).map((t) => t.name),
		}))

		return {
			items,
			hasMore: data.meta.current_page < data.meta.last_page,
			total: data.meta.total,
		}
	}
}
