"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesState {
	ids: string[]
	hydrated: boolean
	toggleLocal: (key: string) => void
	has: (key: string) => boolean
	setIds: (ids: string[]) => void
	setHydrated: () => void
	reset: () => void
}

function key(source: string, externalId: string): string {
	return `${source}:${externalId}`
}

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			ids: [],
			hydrated: false,
			toggleLocal: (k) => {
				const current = get().ids
				set({
					ids: current.includes(k) ? current.filter((x) => x !== k) : [...current, k],
				})
			},
			has: (k) => get().ids.includes(k),
			setIds: (ids) => set({ ids }),
			setHydrated: () => set({ hydrated: true }),
			reset: () => set({ ids: [] }),
		}),
		{
			name: "walls-favorites-ids",
			onRehydrateStorage: () => (state) => {
				state?.setHydrated()
			},
		},
	),
)

export function favoriteKey(source: string, externalId: string): string {
	return key(source, externalId)
}
