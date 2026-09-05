# Walls.

A minimalist, modern wallpaper gallery built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Drizzle ORM**, and **Neon Postgres**.

Browse curated wallpapers from multiple sources, search, filter by category, preview in HD, download, and save favorites that persist across sessions.

## Features

- Clean, minimalist UI with light & dark mode
- Curated categories: All, Nature, Abstract, Urban, Dark, Anime, Studio Ghibli
- HD preview modal with one-click download
- Favorites stored in the cloud (Neon DB) tied to your device
- Search with debounce
- Load more pagination
- Fully typed with TypeScript (strict)
- Pluggable source architecture — add a new wallpaper API by creating one file

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | shadcn/ui (Radix + Tailwind v4) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Font | Geist Sans + Geist Mono |
| State | Zustand v5 |
| Validation | Zod |
| Toasts | Sonner |
| DB | Neon Postgres (HTTP) |
| ORM | Drizzle |
| Linter | Biome |
| Pkg manager | pnpm |

## Getting Started

### 1. Prerequisites

- **Node.js 20+**
- **pnpm 9+** — `npm install -g pnpm` (or use `npx pnpm`)
- A free **Neon** account — https://neon.tech

### 2. Install

```bash
pnpm install
```

### 3. Configure the database

1. Go to https://neon.tech and create a free project
2. Copy the **connection string** (it looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/walls?sslmode=require`)
3. Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/walls?sslmode=require
```

4. Push the schema to your database:

```bash
pnpm db:migrate
```

(If you change the schema, regenerate migrations first with `pnpm db:generate`, then run `pnpm db:migrate` again.)

### 4. Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format with Biome |
| `pnpm db:migrate` | Apply Drizzle migrations to your Neon database |
| `pnpm db:studio` | Open Drizzle Studio (GUI for your DB) |
| `pnpm db:generate` | Generate a new SQL migration from the schema |

## Project Structure

```
walls/
├── app/                    # Next.js App Router
│   ├── api/favorites/      # POST/GET/DELETE favorites
│   ├── category/[slug]/    # Dynamic category pages
│   ├── favorites/          # User favorites
│   ├── about/              # About page
│   ├── layout.tsx
│   └── page.tsx            # Home
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── layout/             # Navbar, Footer, ThemeToggle
│   ├── home/               # Hero, Tabs, Grid
│   ├── wallpaper/          # Card, Modal, Skeleton, Empty
│   └── shared/             # SearchBar, LoadMore
├── lib/
│   ├── sources/            # ⭐ Pluggable wallpaper sources
│   │   ├── base.ts         # Abstract Source class
│   │   ├── picsum.ts
│   │   ├── waifu.ts
│   │   ├── ghibli.ts
│   │   └── index.ts        # Source registry
│   ├── config.ts           # App-wide config
│   ├── categories.ts       # Category list
│   ├── types.ts            # Shared types
│   ├── download.ts         # Download helper
│   └── utils.ts            # cn() helper
├── db/
│   ├── schema.ts           # Drizzle schema
│   ├── index.ts            # DB client
│   └── queries/favorites.ts
├── store/                  # Zustand stores
├── hooks/                  # Custom React hooks
├── drizzle.config.ts
├── biome.json
├── components.json         # shadcn config
└── next.config.ts
```

## Adding a New Wallpaper Source

The app is built around a **pluggable source** system. To add a new source (e.g. Unsplash, NASA, your own API):

### 1. Create the source

Create `lib/sources/my-source.ts`:

```ts
import { BaseSource } from "./base";
import type { FetchParams, FetchResult, ImageSize, WallpaperItem } from "../types";

export class MySource extends BaseSource {
	readonly id = "my-source" as const;
	readonly name = "My Source";
	readonly categories = ["my-cat"];

	async fetch(params: FetchParams): Promise<FetchResult> {
		const res = await fetch(`https://api.example.com/wallpapers?page=${params.page}&limit=${params.limit}`);
		const data = await res.json();
		const items: WallpaperItem[] = data.results.map((r: any) => ({
			id: r.id,
			source: "my-source",
			title: r.title,
			author: r.author,
			thumb: r.thumb_url,
			full: r.full_url,
			download: r.full_url,
			width: r.width,
			height: r.height,
			tags: r.tags ?? [],
		}));
		return { items, hasMore: data.has_more };
	}

	getImageUrl(item: WallpaperItem, size: ImageSize): string {
		return item.full;
	}

	getDownloadUrl(item: WallpaperItem): string {
		return item.download;
	}
}
```

### 2. Register it

Edit `lib/sources/index.ts`:

```ts
import { MySource } from "./my-source";

const sources: Record<string, BaseSource> = {
	picsum: new PicsumSource(),
	waifu: new WaifuSource(),
	ghibli: new GhibliSource(),
	"my-source": new MySource(),
};
```

### 3. Add the source ID to types

Edit `lib/types.ts`:

```ts
export type SourceId = "picsum" | "waifu" | "ghibli" | "my-source";
```

### 4. Add a category

Edit `lib/categories.ts`:

```ts
export const CATEGORIES: Category[] = [
	// ...
	{ id: "my-cat", label: "My Category", sources: ["my-source"] },
];
```

That's it. The navbar tabs, the gallery, the modal, and the API will all pick it up automatically.

## Deploying

This is a standard Next.js app. Deploy to Vercel, Netlify, or any Node host:

1. Push to GitHub
2. Import the repo in Vercel
3. Add the `DATABASE_URL` env var
4. Deploy

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `DATABASE_URL is not set` | Make sure `.env.local` exists and contains the connection string |
| `Module not found` after install | Delete `node_modules` and `pnpm-lock.yaml`, then `pnpm install` |
| Port 3000 in use | Run `pnpm dev -- -p 3001` instead |
| Images not loading | Check `next.config.ts` — add the image host to `remotePatterns` |
| Drizzle push fails | Verify the connection string is correct and ends with `?sslmode=require` |

## License

MIT
