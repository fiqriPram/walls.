import { CONFIG } from "@/lib/config"

export function Footer() {
	return (
		<footer className="border-t border-border/40 py-8 mt-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
				<p>
					© {new Date().getFullYear()} {CONFIG.appName} Crafted with care.
				</p>
				<p className="text-xs">Images via Picsum, Waifu.im & Studio Ghibli API.</p>
			</div>
		</footer>
	)
}
