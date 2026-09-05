import type { FetchParams, FetchResult, ImageSize, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface NekosImage {
	id: number
	url: string
	rating: "safe" | "questionable" | "explicit"
	color_dominant: number[]
	color_palette: number[][]
	artist_name: string | null
	tags: string[]
	source_url: string | null
}

interface NekosListResponse {
	items: NekosImage[]
}

const BASE_URL = "https://api.nekosapi.com/v4"
const HEADERS: HeadersInit = {
	Accept: "application/json",
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

export class NekosSource extends BaseSource {
	readonly id = "nekos" as const
	readonly name = "Nekos API"
	readonly categories = ["anime"]

	private async fetchPage(
		page: number,
		limit: number,
		search?: string,
	): Promise<NekosListResponse> {
		const url = new URL(`${BASE_URL}/images`)
		url.searchParams.set("rating", "safe")
		url.searchParams.set("page", String(page))
		url.searchParams.set("limit", String(limit))
		if (search?.trim()) {
			url.searchParams.set("tag", search.trim().toLowerCase())
		}
		const res = await fetch(url.toString(), {
			headers: HEADERS,
			next: { revalidate: 3600 },
		})
		if (!res.ok) throw new Error(`Nekos API error: ${res.status}`)
		return (await res.json()) as NekosListResponse
	}

	async fetch(params: FetchParams): Promise<FetchResult> {
		const { page, limit, search } = params
		const data = await this.fetchPage(page, limit, search)

		const items: WallpaperItem[] = data.items.map((img) => {
			const tags = img.tags ?? []
			const firstTag = tags[0] ?? "anime"
			return {
				id: String(img.id),
				source: "nekos",
				title: `Anime · ${capitalize(firstTag.replace(/_/g, " "))}`,
				author: img.artist_name ?? "Unknown",
				thumb: img.url,
				full: img.url,
				download: img.url,
				width: 1920,
				height: 1080,
				tags,
			}
		})

		return {
			items,
			hasMore: items.length >= limit,
		}
	}

	getImageUrl(_item: WallpaperItem, _size: ImageSize): string {
		return _item.thumb
	}

	getDownloadUrl(item: WallpaperItem): string {
		return item.download
	}
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}
