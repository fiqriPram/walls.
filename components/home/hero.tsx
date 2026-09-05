"use client"

import { ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CONFIG } from "@/lib/config"

export function Hero() {
	const scrollToGallery = () => {
		document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	return (
		<section className="relative overflow-hidden border-b border-border/40">
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 via-background to-background" />
			<div className="mx-auto flex min-h-[40vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
				<h1 className="text-5xl font-semibold tracking-tighter sm:text-6xl">{CONFIG.appName}</h1>
				<p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">{CONFIG.tagline}</p>
				<div className="mt-8 flex items-center gap-3">
					<Button onClick={scrollToGallery} size="lg">
						{CONFIG.heroCta}
						<ArrowDown className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</section>
	)
}
