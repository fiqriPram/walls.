import type { FetchParams, FetchResult, ImageSize, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface PicsumListItem {
	id: string
	author: string
	width: number
	height: number
	url: string
	download_url: string
}

const PICKSUM_TAGS: Record<string, string[]> = {
	nature: ["nature", "forest", "mountain", "river", "ocean", "sky"],
	abstract: ["abstract", "pattern", "texture", "geometric"],
	urban: ["city", "urban", "street", "architecture", "building"],
	dark: ["night", "dark", "shadow"],
}

const SIZE_PRESETS: Array<{ w: number; h: number }> = [
	{ w: 1920, h: 1080 },
	{ w: 1080, h: 1920 },
	{ w: 2560, h: 1440 },
	{ w: 1440, h: 2560 },
	{ w: 2048, h: 1152 },
]

function pickSize(seed: string): { w: number; h: number } {
	const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0)
	return SIZE_PRESETS[hash % SIZE_PRESETS.length]
}

export class PicsumSource extends BaseSource {
	readonly id = "picsum" as const
	readonly name = "Picsum"
	readonly categories = ["all", "nature", "abstract", "urban", "dark"]

	private async fetchList(page: number, limit: number): Promise<PicsumListItem[]> {
		const url = `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
		const res = await fetch(url, { next: { revalidate: 3600 } })
		if (!res.ok) throw new Error(`Picsum API error: ${res.status}`)
		return (await res.json()) as PicsumListItem[]
	}

	async fetch(params: FetchParams): Promise<FetchResult> {
		const { page, limit, search, category } = params
		const buffer = category === "all" || !category ? limit : limit + 10
		const data = await this.fetchList(page, Math.min(buffer, 100))
		const tags = category && category !== "all" ? (PICKSUM_TAGS[category] ?? []) : []

		let items: WallpaperItem[] = data.map((d) => {
			const size = pickSize(d.id)
			const thumb = `https://picsum.photos/id/${d.id}/600/${Math.round((600 / size.w) * size.h)}`
			const full = `https://picsum.photos/id/${d.id}/${size.w}/${size.h}`
			const download = `https://picsum.photos/id/${d.id}/1920/1080`
			return {
				id: d.id,
				source: "picsum",
				title: `Photo by ${d.author}`,
				author: d.author,
				thumb,
				full,
				download,
				width: size.w,
				height: size.h,
				tags,
			}
		})

		if (tags.length > 0) {
			items = items.filter((i) => i.tags.length > 0)
		}

		if (search) {
			const q = search.toLowerCase()
			items = items.filter(
				(i) => i.author.toLowerCase().includes(q) || i.title.toLowerCase().includes(q),
			)
		}

		return {
			items: items.slice(0, limit),
			hasMore: data.length >= limit,
		}
	}

	getImageUrl(item: WallpaperItem, size: ImageSize): string {
		const h = size.height ?? Math.round((size.width / item.width) * item.height)
		return `https://picsum.photos/id/${item.id}/${size.width}/${h}`
	}

	getDownloadUrl(_item: WallpaperItem): string {
		return "https://picsum.photos/id/${item.id}/1920/1080".replace("${item.id}", _item.id)
	}
}
