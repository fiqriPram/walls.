import type { FetchParams, FetchResult, SourceInfo } from "../types"

/** Base class for pluggable wallpaper sources. Extend it and register in index.ts. */
export abstract class BaseSource {
	abstract readonly id: SourceInfo["id"]
	abstract readonly name: string
	abstract readonly categories: string[]

	abstract fetch(params: FetchParams): Promise<FetchResult>

	protected async getJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(timeoutMs),
			headers: { "User-Agent": "walls-gallery/1.0" },
		})
		if (!res.ok) {
			throw new Error(`${this.name} request failed: ${res.status}`)
		}
		return (await res.json()) as T
	}

	info(): SourceInfo {
		return { id: this.id, name: this.name, categories: this.categories }
	}
}
