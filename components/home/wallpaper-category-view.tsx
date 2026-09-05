"use client"

import { useState } from "react"

import { LoadMore } from "@/components/shared/load-more"
import { SearchBar } from "@/components/shared/search-bar"
import { EmptyState } from "@/components/wallpaper/empty-state"
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card"
import { WallpaperModal } from "@/components/wallpaper/wallpaper-modal"
import { WallpaperSkeleton } from "@/components/wallpaper/wallpaper-skeleton"
import { useDebounce } from "@/hooks/use-debounce"
import { useWallpapers } from "@/hooks/use-wallpapers"
import type { WallpaperItem } from "@/lib/types"

interface Props {
	categoryId: string
	label: string
}

export function WallpaperCategoryView({ categoryId, label }: Props) {
	const [search, setSearch] = useState("")
	const debounced = useDebounce(search, 350)
	const [active, setActive] = useState<WallpaperItem | null>(null)

	const { items, isLoading, isLoadingMore, hasMore, loadMore, error } = useWallpapers({
		category: categoryId,
		search: debounced,
	})

	return (
		<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Curated wallpapers in {label.toLowerCase()}.
					</p>
				</div>
				<SearchBar value={search} onChange={setSearch} placeholder="Search..." />
			</div>

			<div className="mt-8">
				{isLoading ? (
					<WallpaperSkeleton />
				) : error ? (
					<EmptyState title="Could not load" description={error} />
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
