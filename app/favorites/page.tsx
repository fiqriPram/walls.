"use client"

import { Heart } from "lucide-react"
import { useEffect, useState } from "react"

import { EmptyState } from "@/components/wallpaper/empty-state"
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card"
import { WallpaperModal } from "@/components/wallpaper/wallpaper-modal"
import { WallpaperSkeleton } from "@/components/wallpaper/wallpaper-skeleton"
import { useDeviceId } from "@/hooks/use-device-id"
import type { WallpaperItem } from "@/lib/types"

export default function FavoritesPage() {
	const deviceId = useDeviceId()
	const [items, setItems] = useState<WallpaperItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [active, setActive] = useState<WallpaperItem | null>(null)

	useEffect(() => {
		if (!deviceId || deviceId === "ssr") return
		let cancelled = false
		;(async () => {
			try {
				setIsLoading(true)
				const res = await fetch(`/api/favorites?deviceId=${encodeURIComponent(deviceId)}`)
				if (!res.ok) throw new Error("Failed to load")
				const data = (await res.json()) as { items: WallpaperItem[] }
				if (!cancelled) setItems(data.items)
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : "Failed to load")
				}
			} finally {
				if (!cancelled) setIsLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [deviceId])

	return (
		<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex items-center gap-2">
				<Heart className="h-5 w-5" />
				<h1 className="text-2xl font-semibold tracking-tight">Your favorites</h1>
			</div>
			<p className="mt-1 text-sm text-muted-foreground">
				Wallpapers you have saved. Stored permanently in our database tied to this device.
			</p>

			<div className="mt-8">
				{isLoading ? (
					<WallpaperSkeleton />
				) : error ? (
					<EmptyState title="Could not load favorites" description={error} />
				) : items.length === 0 ? (
					<EmptyState
						title="No favorites yet"
						description="Tap the heart on any wallpaper to save it here."
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{items.map((item) => (
							<WallpaperCard key={`${item.source}-${item.id}`} item={item} onOpen={setActive} />
						))}
					</div>
				)}
			</div>

			<WallpaperModal item={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
		</section>
	)
}
