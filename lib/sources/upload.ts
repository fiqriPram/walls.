import { listWallpapers } from "@/db/queries/wallpapers"

import type { FetchParams, FetchResult } from "../types"
import { BaseSource } from "./base"

/** DB-backed user uploads. */
export class UploadSource extends BaseSource {
	readonly id = "upload" as const
	readonly name = "Community Uploads"
	readonly categories = ["all", "nature", "abstract", "urban", "dark", "anime"]

	async fetch(params: FetchParams): Promise<FetchResult> {
		return listWallpapers(params)
	}
}
