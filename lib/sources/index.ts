import type { SourceInfo } from "../types"

const sources: Record<string, never> = {}

export function getSource(_id: string): undefined {
	return undefined
}

export function listSources(): SourceInfo[] {
	return []
}
