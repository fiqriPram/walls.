import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "picsum.photos" },
			{ protocol: "https", hostname: "fastly.picsum.photos" },
			{ protocol: "https", hostname: "image.tmdb.org" },
			{ protocol: "https", hostname: "ghibliapi.vercel.app" },
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
}

export default nextConfig
