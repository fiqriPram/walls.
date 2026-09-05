import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "picsum.photos" },
			{ protocol: "https", hostname: "fastly.picsum.photos" },
			{ protocol: "https", hostname: "cdn.waifu.im" },
			{ protocol: "https", hostname: "image-api.waifu.im" },
			{ protocol: "https", hostname: "ghibliapi.vercel.app" },
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
}

export default nextConfig
