export const CONFIG = {
	appName: "Walls.",
	tagline: "Minimalist wallpapers for every screen.",
	description:
		"A curated collection of minimalist wallpapers across nature, abstract, dark, urban, and Studio Ghibli.",
	itemsPerPage: 30,
	defaultCategory: "all",
	enableDownload: true,
	enableFavorites: true,
	enableSearch: true,
	enableDarkMode: true,
	heroCta: "Explore",
	downloadResolution: {
		width: 1920,
		height: 1080,
	},
} as const

export type AppConfig = typeof CONFIG
