import type { FetchParams, FetchResult, ImageSize, WallpaperItem } from "../types"
import { BaseSource } from "./base"

interface GhibliFilm {
	id: string
	title: string
	original_title: string
	original_title_romanised: string
	image: string
	movie_banner: string
	description: string
	director: string
	producer: string
	release_date: string
	running_time: string
	rt_score: string
}

export class GhibliSource extends BaseSource {
	readonly id = "ghibli" as const
	readonly name = "Studio Ghibli"
	readonly categories = ["ghibli"]

	private cache: GhibliFilm[] | null = null

	private async getFilms(): Promise<GhibliFilm[]> {
		if (this.cache) return this.cache
		const res = await fetch("https://ghibliapi.vercel.app/films", {
			next: { revalidate: 86400 },
		})
		if (!res.ok) throw new Error(`Ghibli API error: ${res.status}`)
		this.cache = (await res.json()) as GhibliFilm[]
		return this.cache
	}

	async fetch(params: FetchParams): Promise<FetchResult> {
		const { page, limit, search } = params
		const films = await this.getFilms()
		const candidates: WallpaperItem[] = films
			.filter((f) => f.movie_banner || f.image)
			.map((f) => {
				const banner = f.movie_banner || f.image
				return {
					id: f.id,
					source: "ghibli",
					title: f.title,
					author: f.director,
					thumb: f.image,
					full: banner,
					download: banner,
					width: 1920,
					height: 1080,
					tags: ["ghibli", f.release_date?.slice(0, 4) ?? ""].filter(Boolean),
				}
			})

		let items = candidates
		if (search) {
			const q = search.toLowerCase()
			items = items.filter(
				(i) => i.title.toLowerCase().includes(q) || i.author.toLowerCase().includes(q),
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

	getImageUrl(item: WallpaperItem, _size: ImageSize): string {
		return item.full
	}

	getDownloadUrl(item: WallpaperItem): string {
		return item.download
	}
}
