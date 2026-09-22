import type { SourceId, SourceInfo } from "../types"
import type { BaseSource } from "./base"
import { UploadSource } from "./upload"
import { WallhavenSource } from "./wallhaven"

const sources: Record<SourceId, BaseSource> = {
	upload: new UploadSource(),
	wallhaven: new WallhavenSource(),
}

export function getSource(id: string): BaseSource | undefined {
	return (sources as Record<string, BaseSource>)[id]
}

export function listSources(): SourceInfo[] {
	return Object.values(sources).map((s) => s.info())
}

export function isExternalSource(id: string): id is Exclude<SourceId, "upload"> {
	return id !== "upload" && id in sources
}
