"use client"

import { useState } from "react"

import { useDebounce } from "@/hooks/use-debounce"
import { useWallpapers } from "@/hooks/use-wallpapers"
import type { WallpaperItem } from "@/lib/types"

import { LoadMore } from "@/components/shared/load-more"
import { SearchBar } from "@/components/shared/search-bar"
import { EmptyState } from "@/components/wallpaper/empty-state"
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card"
import { WallpaperModal } from "@/components/wallpaper/wallpaper-modal"
import { WallpaperSkeleton } from "@/components/wallpaper/wallpaper-skeleton"
import { CategoryTabs } from "./category-tabs"

export function WallpaperGrid() {
	const [category, setCategory] = useState("all")
	const [searchInput, setSearchInput] = useState("")
	const debouncedSearch = useDebounce(searchInput, 350)
	const [active, setActive] = useState<WallpaperItem | null>(null)

	const { items, isLoading, isLoadingMore, hasMore, loadMore, error } = useWallpapers({
		category,
		search: debouncedSearch,
	})

	return (
		<section id="gallery" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CategoryTabs value={category} onChange={setCategory} />
				<SearchBar
					value={searchInput}
					onChange={setSearchInput}
					placeholder="Search author, tag..."
				/>
			</div>

			<div className="mt-6">
				{isLoading ? (
					<WallpaperSkeleton />
				) : error ? (
					<EmptyState title="Something went wrong" description={error} />
				) : items.length === 0 ? (
					<EmptyState />
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{items.map((item) => (
								<WallpaperCard key={`${item.source}-${item.id}`} item={item} onOpen={setActive} />
							))}
						</div>
						<LoadMore onClick={loadMore} isLoading={isLoadingMore} hasMore={hasMore} />
					</>
				)}
			</div>

			<WallpaperModal item={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
		</section>
	)
}
