import type { SourceInfo } from "../types"
import type { BaseSource } from "./base"
import { GhibliSource } from "./ghibli"
import { PicsumSource } from "./picsum"
import { WaifuSource } from "./waifu"

const sources: Record<string, BaseSource> = {
	picsum: new PicsumSource(),
	waifu: new WaifuSource(),
	ghibli: new GhibliSource(),
}

export function getSource(id: string): BaseSource | undefined {
	return sources[id]
}

export function listSources(): SourceInfo[] {
	return Object.values(sources).map((s) => ({
		id: s.id,
		name: s.name,
		categories: s.categories,
	}))
}

export { BaseSource } from "./base"
