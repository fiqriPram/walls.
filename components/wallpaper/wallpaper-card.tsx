"use client"

import { Download, Heart } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { useDeviceId } from "@/hooks/use-device-id"
import { CONFIG } from "@/lib/config"
import { downloadImage, safeFilename } from "@/lib/download"
import type { WallpaperItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { favoriteKey, useFavoritesStore } from "@/store/use-favorites"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface WallpaperCardProps {
	item: WallpaperItem
	onOpen: (item: WallpaperItem) => void
}

export function WallpaperCard({ item, onOpen }: WallpaperCardProps) {
	const [isFav, setIsFav] = useState(false)
	const [busy, setBusy] = useState(false)
	const deviceId = useDeviceId()
	const toggleLocal = useFavoritesStore((s) => s.toggleLocal)
	const has = useFavoritesStore((s) => s.has)
	const hydrated = useFavoritesStore((s) => s.hydrated)

	const favorited = hydrated ? has(favoriteKey(item.source, item.id)) : isFav

	const toggleFavorite = async (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!deviceId || deviceId === "ssr") return
		setBusy(true)
		const key = favoriteKey(item.source, item.id)
		const wasFav = favorited
		toggleLocal(key)
		try {
			if (wasFav) {
				const url = `/api/favorites/${item.id}?deviceId=${encodeURIComponent(
					deviceId,
				)}&source=${item.source}&externalId=${item.id}`
				const res = await fetch(url, { method: "DELETE" })
				if (!res.ok) throw new Error("Failed")
				toast.success("Removed from favorites")
			} else {
				const res = await fetch("/api/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ deviceId, item }),
				})
				if (!res.ok) throw new Error("Failed")
				toast.success("Added to favorites")
			}
		} catch {
			toggleLocal(key)
			toast.error("Could not update favorites")
		} finally {
			setBusy(false)
		}
	}

	const handleDownload = async (e: React.MouseEvent) => {
		e.stopPropagation()
		await downloadImage(item.download, safeFilename(item.title, item.source, item.id))
		toast.success("Download started")
	}

	return (
		<article
			onClick={() => onOpen(item)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault()
					onOpen(item)
				}
			}}
			aria-label={`View wallpaper: ${item.title}`}
			className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-card text-left transition-all hover:border-border hover:shadow-sm focus-within:ring-2 focus-within:ring-ring"
		>
			<div className="relative aspect-video w-full overflow-hidden bg-muted">
				<Image
					src={item.thumb}
					alt={item.title}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					unoptimized
				/>
				<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 opacity-0 transition-opacity group-hover:opacity-100">
					<Badge variant="secondary" className="bg-background/80 backdrop-blur">
						{item.source}
					</Badge>
					<div className="flex gap-1.5">
						<Button
							variant="secondary"
							size="icon"
							className="h-7 w-7 bg-background/80 backdrop-blur"
							onClick={handleDownload}
							aria-label="Download"
							disabled={!CONFIG.enableDownload}
						>
							<Download className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							className={cn("h-7 w-7 bg-background/80 backdrop-blur", favorited && "text-red-500")}
							onClick={toggleFavorite}
							disabled={busy}
							aria-label="Favorite"
						>
							<Heart className={cn("h-3.5 w-3.5", favorited && "fill-current")} />
						</Button>
					</div>
				</div>
			</div>
			<div className="px-3 py-2">
				<p className="truncate text-sm font-medium">{item.title}</p>
				<p className="truncate text-xs text-muted-foreground">{item.author}</p>
				{item.tags.length > 0 ? (
					<div className="mt-1.5 flex flex-wrap gap-1">
						{item.tags.slice(0, 3).map((t) => (
							<Badge
								key={t}
								variant="outline"
								className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
							>
								{t}
							</Badge>
						))}
					</div>
				) : (
					item.colors &&
					item.colors.length > 0 && (
						<div className="mt-1.5 flex items-center gap-1">
							{item.colors.slice(0, 5).map((c) => (
								<span
									key={c}
									title={c}
									className="h-3 w-3 rounded-full border border-border/60"
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					)
				)}
			</div>
		</article>
	)
}
