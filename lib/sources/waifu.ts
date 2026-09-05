import type { FetchParams, FetchResult, ImageSize, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface WaifuFile {
	_id: string
	image_id: number
	tags: string[]
	author: string
	width: number
	height: number
	url: string
	preview_url: string
}

interface WaifuListResponse {
	files: WaifuFile[]
}

export class WaifuSource extends BaseSource {
	readonly id = "waifu" as const
	readonly name = "Waifu.im"
	readonly categories = ["anime"]

	async fetch(params: FetchParams): Promise<FetchResult> {
		const { page, limit, search } = params
		const isNsfw = false
		const orientation = "landscape"
		const url = new URL("https://api.waifu.im/search")
		url.searchParams.set("included_tags", "waifu")
		url.searchParams.set("is_nsfw", String(isNsfw))
		url.searchParams.set("orientation", orientation)
		url.searchParams.set("many", "true")

		const res = await fetch(url.toString(), {
			next: { revalidate: 3600 },
		})
		if (!res.ok) throw new Error(`Waifu API error: ${res.status}`)
		const data = (await res.json()) as WaifuListResponse

		let items: WallpaperItem[] = (data.files ?? []).map((f) => ({
			id: String(f.image_id),
			source: "waifu",
			title: f.tags[0] ? `Anime · ${capitalize(f.tags[0])}` : "Anime Wallpaper",
			author: f.author || "Unknown",
			thumb: f.preview_url,
			full: f.url,
			download: f.url,
			width: f.width || 1920,
			height: f.height || 1080,
			tags: f.tags ?? [],
		}))

		if (search) {
			const q = search.toLowerCase()
			items = items.filter(
				(i) =>
					i.title.toLowerCase().includes(q) ||
					i.author.toLowerCase().includes(q) ||
					i.tags.some((t) => t.toLowerCase().includes(q)),
			)
		}

		const start = (page - 1) * limit
		const paged = items.slice(start, start + limit)

		return {
			items: paged,
			hasMore: start + limit < items.length,
			total: items.length,
		}
	}

	getImageUrl(_item: WallpaperItem, size: ImageSize): string {
		return _item.thumb
	}

	getDownloadUrl(item: WallpaperItem): string {
		return item.full
	}
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}
