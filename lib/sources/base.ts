import type { FetchParams, FetchResult, ImageSize, SourceInfo, WallpaperItem } from "../types"

export abstract class BaseSource {
	abstract readonly id: SourceInfo["id"]
	abstract readonly name: string
	abstract readonly categories: string[]

	abstract fetch(params: FetchParams): Promise<FetchResult>
	abstract getImageUrl(item: WallpaperItem, size: ImageSize): string
	abstract getDownloadUrl(item: WallpaperItem): string
}
