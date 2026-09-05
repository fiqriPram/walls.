import type { Metadata } from "next"

import { Hero } from "@/components/home/hero"
import { WallpaperGrid } from "@/components/home/wallpaper-grid"
import { CONFIG } from "@/lib/config"

export const metadata: Metadata = {
	title: {
		default: CONFIG.appName,
		template: `%s · ${CONFIG.appName}`,
	},
	description: CONFIG.description,
	openGraph: {
		title: CONFIG.appName,
		description: CONFIG.description,
		type: "website",
	},
}

export default function HomePage() {
	return (
		<>
			<Hero />
			<WallpaperGrid />
		</>
	)
}
