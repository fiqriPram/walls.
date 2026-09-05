"use client"

import { Download, ExternalLink, Heart } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

import { useDeviceId } from "@/hooks/use-device-id"
import { CONFIG } from "@/lib/config"
import { downloadImage, safeFilename } from "@/lib/download"
import type { WallpaperItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { favoriteKey, useFavoritesStore } from "@/store/use-favorites"

interface WallpaperModalProps {
	item: WallpaperItem | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function WallpaperModal({ item, open, onOpenChange }: WallpaperModalProps) {
	const deviceId = useDeviceId()
	const toggleLocal = useFavoritesStore((s) => s.toggleLocal)
	const has = useFavoritesStore((s) => s.has)
	const hydrated = useFavoritesStore((s) => s.hydrated)

	if (!item) return null

	const favorited = hydrated ? has(favoriteKey(item.source, item.id)) : false

	const handleFavorite = async () => {
		if (!deviceId || deviceId === "ssr") return
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
		}
	}

	const handleDownload = async () => {
		await downloadImage(item.download, safeFilename(item.title, item.source, item.id))
		toast.success("Download started")
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
				<div className="relative aspect-video w-full bg-muted">
					<Image
						src={item.full}
						alt={item.title}
						fill
						sizes="(max-width: 1024px) 100vw, 1024px"
						className="object-contain"
						unoptimized
						priority
					/>
				</div>
				<div className="p-5">
					<DialogHeader>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<DialogTitle className="truncate">{item.title}</DialogTitle>
								<DialogDescription className="truncate">
									by {item.author} · {item.width}×{item.height}
								</DialogDescription>
							</div>
							<Badge variant="secondary">{item.source}</Badge>
						</div>
					</DialogHeader>

					{item.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{item.tags.slice(0, 6).map((t) => (
								<Badge key={t} variant="outline" className="text-xs">
									{t}
								</Badge>
							))}
						</div>
					)}

					<div className="mt-5 flex flex-wrap gap-2">
						<Button onClick={handleDownload} disabled={!CONFIG.enableDownload}>
							<Download className="h-4 w-4" />
							Download HD
						</Button>
						<Button variant={favorited ? "default" : "outline"} onClick={handleFavorite}>
							<Heart className={cn("h-4 w-4", favorited && "fill-current")} />
							{favorited ? "Favorited" : "Add to favorites"}
						</Button>
						<Button asChild variant="ghost">
							<a href={item.full} target="_blank" rel="noopener noreferrer">
								<ExternalLink className="h-4 w-4" />
								Open
							</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
