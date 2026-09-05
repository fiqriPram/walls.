"use client"

import { Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { CONFIG } from "@/lib/config"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "./theme-toggle"

const links = [
	{ href: "/", label: "Home" },
	{ href: "/favorites", label: "Favorites" },
	{ href: "/about", label: "About" },
]

export function Navbar() {
	const pathname = usePathname()

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
					<span className="text-lg tracking-tighter">{CONFIG.appName}</span>
				</Link>

				<nav className="flex items-center gap-1">
					{links.map((l) => {
						const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
						return (
							<Link
								key={l.href}
								href={l.href}
								className={cn(
									"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
									active
										? "bg-foreground/5 text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{l.label === "Favorites" ? (
									<span className="flex items-center gap-1.5">
										<Heart className="h-3.5 w-3.5" />
										{l.label}
									</span>
								) : (
									l.label
								)}
							</Link>
						)
					})}
					<div className="ml-2">
						<ThemeToggle />
					</div>
				</nav>
			</div>
		</header>
	)
}
