"use client"

import { ArrowDown, Download, Heart, Image, Layers } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"
import { CATEGORIES } from "@/lib/categories"
import { CONFIG } from "@/lib/config"

const FEATURES = [
	{ icon: Image, label: "Curated Collection", desc: "Hand-picked wallpapers across 3 sources" },
	{ icon: Heart, label: "Favorites", desc: "Save and sync across devices" },
	{ icon: Download, label: "Free Download", desc: "No sign-up required" },
]

export function Hero() {
	const [counts, setCounts] = useState({ total: 0, categories: 0 })
	const { scrollTo } = useSmoothScroll()

	const scrollToGallery = () => {
		scrollTo("#gallery", { duration: 1.2, offset: 64 })
	}

	useEffect(() => {
		let cancelled = false
		const timer = setTimeout(async () => {
			try {
				const res = await fetch("/api/wallpapers?category=all&page=1&limit=1&search=")
				if (!res.ok) return
				const data = await res.json()
				if (cancelled) return
				setCounts({
					total: data.total ?? data.items?.length ?? 0,
					categories: CATEGORIES.filter((c) => c.id !== "all").length,
				})
			} catch {
				if (cancelled) return
				setCounts({ total: 50, categories: CATEGORIES.filter((c) => c.id !== "all").length })
			}
		}, 100)
		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [])

	return (
		<section className="relative overflow-hidden border-b border-border/40">
			<div className="absolute inset-0 -z-10 bg-linear-to-b from-muted/50 via-background to-background" />

			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="pointer-events-none absolute -top-40 left-1/2 h-150 w-150 -translate-x-1/2 rounded-full bg-muted/30 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-20 left-1/4 h-75 w-75 rounded-full bg-muted/20 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-20 right-1/4 h-75 w-75 rounded-full bg-muted/20 blur-3xl" />
			</div>

			<div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
				<div className="mb-4 flex items-center gap-2">
					<Layers className="h-5 w-5 text-muted-foreground" />
					<span className="text-sm font-medium text-muted-foreground">
						{CATEGORIES.filter((c) => c.id !== "all")
							.map((c) => c.label)
							.join(" · ")}
					</span>
				</div>

				<h1 className="text-6xl font-semibold tracking-tighter sm:text-7xl lg:text-8xl">
					{CONFIG.appName}
				</h1>

				<p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">{CONFIG.tagline}</p>

				{counts.total > 0 && (
					<div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Image className="h-3.5 w-3.5" />
							<span>
								<span className="font-medium text-foreground">{counts.total}+</span> wallpapers
							</span>
						</div>
						<div className="h-3 w-px bg-border" />
						<div className="flex items-center gap-1.5">
							<Layers className="h-3.5 w-3.5" />
							<span>
								<span className="font-medium text-foreground">{counts.categories}</span> categories
							</span>
						</div>
					</div>
				)}

				<div className="mt-10 flex flex-col items-center gap-4">
					<Button onClick={scrollToGallery} size="lg" className="px-8">
						{CONFIG.heroCta}
						<ArrowDown className="ml-2 h-4 w-4 animate-bounce" />
					</Button>
				</div>

				<div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
					{FEATURES.map((feature) => (
						<div
							key={feature.label}
							className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-4 py-5 text-center backdrop-blur-sm transition-colors hover:border-border hover:bg-card"
						>
							<div className="rounded-lg bg-muted p-2.5">
								<feature.icon className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p className="text-sm font-medium">{feature.label}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
