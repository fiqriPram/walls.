"use client"

import { Heart, Library, LogOut, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { CONFIG } from "@/lib/config"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "./theme-toggle"

type NavLink = {
	href: string
	label: string
	icon?: LucideIcon
}

const guestLinks: NavLink[] = [
	{ href: "/", label: "Home" },
	{ href: "/about", label: "About" },
	{ href: "/auth", label: "Sign in" },
]

const authLinks: NavLink[] = [
	{ href: "/favorites", label: "Favorites", icon: Heart },
	{ href: "/dashboard", label: "Library", icon: Library },
]

export function Navbar() {
	const pathname = usePathname()
	const router = useRouter()
	const { data: session } = authClient.useSession()
	const isAuthed = session?.user != null

	const handleSignOut = async () => {
		await authClient.signOut()
		router.push("/")
		router.refresh()
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
					<span className="text-lg tracking-tighter">{CONFIG.appName}</span>
				</Link>

				<nav className="flex items-center gap-1">
					{(isAuthed ? authLinks : guestLinks).map((l) => {
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
								{l.icon ? (
									<span className="flex items-center gap-1.5">
										<l.icon className="h-3.5 w-3.5" />
										{l.label}
									</span>
								) : (
									l.label
								)}
							</Link>
						)
					})}
					{isAuthed && (
						<button
							type="button"
							onClick={handleSignOut}
							className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							<span className="flex items-center gap-1.5">
								<LogOut className="h-3.5 w-3.5" />
								Sign out
							</span>
						</button>
					)}
					<div className="ml-2">
						<ThemeToggle />
					</div>
				</nav>
			</div>
		</header>
	)
}
