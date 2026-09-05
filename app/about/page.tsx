import type { Metadata } from "next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONFIG } from "@/lib/config"
import { listSources } from "@/lib/sources"

export const metadata: Metadata = {
	title: "About",
	description: `About ${CONFIG.appName}`,
}

export default function AboutPage() {
	const sources = listSources()
	return (
		<section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-semibold tracking-tight">About {CONFIG.appName}</h1>
			<p className="mt-3 text-muted-foreground">{CONFIG.description}</p>

			<h2 className="mt-10 text-xl font-semibold">How it works</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				Wallpapers are streamed from public APIs. We never host the images ourselves. Favorites are
				stored in a Neon Postgres database, tied to a private device ID that lives only in your
				browser. Clearing site data will reset your favorites.
			</p>

			<h2 className="mt-10 text-xl font-semibold">Sources</h2>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				{sources.map((s) => (
					<Card key={s.id}>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">{s.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">Categories: {s.categories.join(", ")}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<h2 className="mt-10 text-xl font-semibold">Extending</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				To add a new wallpaper source, create a new file in{" "}
				<code className="rounded bg-muted px-1.5 py-0.5 text-xs">lib/sources/</code> extending{" "}
				<code className="rounded bg-muted px-1.5 py-0.5 text-xs">BaseSource</code> and register it
				in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">lib/sources/index.ts</code>. Add
				a new category in{" "}
				<code className="rounded bg-muted px-1.5 py-0.5 text-xs">lib/categories.ts</code>.
				That&apos;s it — the UI will pick it up automatically.
			</p>
		</section>
	)
}
