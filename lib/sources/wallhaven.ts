import type { FetchParams, FetchResult, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface WallhavenSearchItem {
	id: string
	category: string
	resolution: string
	path: string
	colors: string[]
	thumbs: { large: string; original: string; small: string }
	dimension_x: number
	dimension_y: number
}

interface WallhavenSearchResponse {
	data: WallhavenSearchItem[]
	meta: { current_page: number; last_page: number; per_page: number; total: number }
}

interface WallhavenDetailResponse {
	data: {
		id: string
		uploader?: { username: string }
		tags: { id: number; name: string }[]
	}
}

const CATEGORY_QUERY: Record<string, { q?: string; categories?: string; sorting?: string }> = {
	all: { sorting: "toplist" },
	nature: { q: "nature landscape", sorting: "relevance" },
	abstract: { q: "abstract", sorting: "relevance" },
	urban: { q: "city night", sorting: "relevance" },
	dark: { q: "dark", sorting: "relevance" },
	anime: { categories: "010", sorting: "toplist" },
}

/** In-memory cache for wallpaper details (tags + uploader), 1 hour TTL. */
const detailCache = new Map<string, { at: number; tags: string[]; uploader: string | null }>()
const CACHE_TTL_MS = 60 * 60 * 1000
const DETAIL_CONCURRENCY = 6

function prettifyTag(name: string): string {
	return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Wallhaven (wallhaven.cc) — free, no API key needed for SFW.
 * Titles and tags come from each wallpaper's own detail endpoint, since the
 * search API returns neither. Details are cached for an hour.
 * Optional WALLHAVEN_API_KEY env raises the rate limit.
 * Docs: https://wallhaven.cc/help/api
 */
export class WallhavenSource extends BaseSource {
	readonly id = "wallhaven" as const
	readonly name = "Wallhaven"
	readonly categories = ["all", "nature", "abstract", "urban", "dark", "anime"]

	private detailUrl(id: string): string {
		const url = new URL(`https://wallhaven.cc/api/v1/w/${id}`)
		const apiKey = process.env.WALLHAVEN_API_KEY
		if (apiKey) url.searchParams.set("apikey", apiKey)
		return url.toString()
	}

	private async fetchDetail(id: string): Promise<{ tags: string[]; uploader: string | null }> {
		const cached = detailCache.get(id)
		if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
			return { tags: cached.tags, uploader: cached.uploader }
		}
		const data = await this.getJson<WallhavenDetailResponse>(this.detailUrl(id), 8000)
		const tags = (data.data.tags ?? [])
			.map((t) => t.name)
			.filter((n) => n && !/^\d+x\d+$/i.test(n))
			.slice(0, 10)
		const result = { tags, uploader: data.data.uploader?.username ?? null }
		detailCache.set(id, { at: Date.now(), ...result })
		return result
	}

	/** Fetch details with bounded concurrency; failures resolve to null. */
	private async fetchDetails(
		ids: string[],
	): Promise<(Awaited<ReturnType<typeof this.fetchDetail>> | null)[]> {
		const results: (Awaited<ReturnType<typeof this.fetchDetail>> | null)[] = new Array(
			ids.length,
		).fill(null)
		let cursor = 0
		const workers = Array.from({ length: Math.min(DETAIL_CONCURRENCY, ids.length) }, async () => {
			while (cursor < ids.length) {
				const i = cursor++
				try {
					results[i] = await this.fetchDetail(ids[i])
				} catch {
					results[i] = null
				}
			}
		})
		await Promise.all(workers)
		return results
	}

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
		const walls = (data.data ?? []).slice(0, params.limit)
		const details = await this.fetchDetails(walls.map((w) => w.id))

		const items: WallpaperItem[] = walls.map((w, i) => {
			const d = details[i]
			const title =
				d && d.tags.length > 0
					? d.tags.slice(0, 3).map(prettifyTag).join(" · ")
					: `${w.category.charAt(0).toUpperCase()}${w.category.slice(1)} · ${w.resolution.replace("x", "×")}`
			return {
				id: `wallhaven-${w.id}`,
				source: "wallhaven",
				title,
				author: d?.uploader ?? "Wallhaven",
				thumb: w.thumbs.small,
				full: w.path,
				download: w.path,
				width: w.dimension_x,
				height: w.dimension_y,
				tags: d?.tags ?? [],
				colors: (w.colors ?? []).slice(0, 5),
			}
		})

		return {
			items,
			hasMore: data.meta.current_page < data.meta.last_page,
			total: data.meta.total,
		}
	}
}
