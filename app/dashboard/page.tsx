"use client"

import { Image, Loader2, Plus, Search, Sparkles, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { CATEGORIES } from "@/lib/categories"

interface WallpaperEntry {
	id: number
	title: string
	author: string
	category: string
	thumbUrl: string
	fullUrl: string
	width: number
	height: number
	createdAt: string
}

const EMPTY_FORM = {
	title: "",
	author: "",
	category: "all",
	thumbUrl: "",
	fullUrl: "",
	downloadUrl: "",
	width: 1920,
	height: 1080,
	tags: "",
	description: "",
}

const selectableCategories = CATEGORIES.filter((c) => c.id !== "all")

export default function DashboardPage() {
	const router = useRouter()
	const [wallpapers, setWallpapers] = useState<WallpaperEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [query, setQuery] = useState("")

	const [form, setForm] = useState(EMPTY_FORM)

	const { data: session } = authClient.useSession()

	const fetchWallpapers = useCallback(async () => {
		try {
			const res = await fetch("/api/upload")
			if (res.status === 401) {
				router.push("/auth")
				return
			}
			const data = await res.json()
			setWallpapers(data.items ?? [])
		} catch {
			toast.error("Failed to load wallpapers")
		} finally {
			setLoading(false)
		}
	}, [router])

	useEffect(() => {
		if (session === undefined) return
		if (!session) {
			router.push("/auth")
			return
		}
		fetchWallpapers()
	}, [session, router, fetchWallpapers])

	const visibleWallpapers = useMemo(() => {
		const q = query.trim().toLowerCase()
		return wallpapers.filter((w) => {
			if (!q) return true
			return (
				w.title.toLowerCase().includes(q) ||
				w.author.toLowerCase().includes(q) ||
				w.category.toLowerCase().includes(q)
			)
		})
	}, [wallpapers, query])

	const newestWallpaper = wallpapers[0]?.title ?? "—"

	const handleUpload = async () => {
		if (!form.title || !form.thumbUrl || !form.fullUrl) {
			toast.error("Title, Thumbnail URL, and Full URL are required")
			return
		}
		setUploading(true)
		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					downloadUrl: form.downloadUrl || form.fullUrl,
					tags: form.tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean),
				}),
			})
			if (!res.ok) {
				const err = await res.json()
				throw new Error(err.error ?? "Upload failed")
			}
			toast.success("Wallpaper uploaded")
			setForm(EMPTY_FORM)
			setShowForm(false)
			setQuery("")
			fetchWallpapers()
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Upload failed")
		} finally {
			setUploading(false)
		}
	}

	const handleDelete = async (id: number) => {
		try {
			const res = await fetch(`/api/upload?id=${id}`, { method: "DELETE" })
			if (!res.ok) throw new Error("Delete failed")
			toast.success("Wallpaper deleted")
			fetchWallpapers()
		} catch {
			toast.error("Failed to delete")
		}
	}

	const toggleForm = () => setShowForm((v) => !v)

	const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id

	return (
		<div className="relative mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-muted/40 blur-3xl" />

			<div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl">Library</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{session?.user?.name ? (
							<span>
								Welcome back,{" "}
								<span className="font-medium text-foreground">{session.user.name}</span>.
							</span>
						) : (
							"Welcome back."
						)}{" "}
						Browse and manage the wallpapers you&apos;ve added.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={toggleForm} size="sm" className="px-4">
						{showForm ? <X className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
						{showForm ? "Close" : "Add Wallpaper"}
					</Button>
				</div>
			</div>

			<div className="relative mt-8 grid gap-4 sm:grid-cols-2">
				<Card className="overflow-hidden">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
							<Image className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">Total wallpapers</p>
							<p className="text-2xl font-semibold tracking-tighter">{wallpapers.length}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="overflow-hidden">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
							<Sparkles className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">Newest upload</p>
							<p className="truncate text-base font-medium tracking-tight">{newestWallpaper}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{showForm && (
				<Card className="relative mt-6">
					<CardContent className="p-6">
						<div className="grid gap-8 lg:grid-cols-[1fr_260px]">
							<form
								onSubmit={(e) => {
									e.preventDefault()
									handleUpload()
								}}
								className="grid gap-4 sm:grid-cols-2"
							>
								<div className="space-y-2 sm:col-span-2">
									<p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
										Details
									</p>
								</div>
								<div className="space-y-2">
									<label htmlFor="w-title" className="text-sm font-medium">
										Title <span className="text-destructive">*</span>
									</label>
									<Input
										id="w-title"
										placeholder="Wallpaper title"
										value={form.title}
										onChange={(e) => setForm({ ...form, title: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="w-author" className="text-sm font-medium">
										Author
									</label>
									<Input
										id="w-author"
										placeholder="Author name"
										value={form.author}
										onChange={(e) => setForm({ ...form, author: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="w-category" className="text-sm font-medium">
										Category
									</label>
									<Select
										value={form.category}
										onValueChange={(v) => setForm({ ...form, category: v })}
									>
										<SelectTrigger id="w-category">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{selectableCategories.map((c) => (
												<SelectItem key={c.id} value={c.id}>
													{c.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label htmlFor="w-tags" className="text-sm font-medium">
										Tags (comma separated)
									</label>
									<Input
										id="w-tags"
										placeholder="nature, landscape, 4k"
										value={form.tags}
										onChange={(e) => setForm({ ...form, tags: e.target.value })}
									/>
								</div>
								<div className="flex items-end justify-between sm:col-span-2">
									<p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
										Media
									</p>
									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<label htmlFor="w-width" className="flex items-center gap-1.5">
											<input
												id="w-width"
												type="number"
												value={form.width}
												onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
												className="w-20 rounded-md border border-input bg-transparent px-2 py-1 text-right text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
											/>
											W
										</label>
										<span className="text-muted-foreground/50">×</span>
										<label htmlFor="w-height" className="flex items-center gap-1.5">
											<input
												id="w-height"
												type="number"
												value={form.height}
												onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
												className="w-20 rounded-md border border-input bg-transparent px-2 py-1 text-right text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
											/>
											H
										</label>
									</div>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<label htmlFor="w-thumb" className="text-sm font-medium">
										Thumbnail URL <span className="text-destructive">*</span>
									</label>
									<Input
										id="w-thumb"
										placeholder="https://example.com/thumb.jpg"
										value={form.thumbUrl}
										onChange={(e) => setForm({ ...form, thumbUrl: e.target.value })}
									/>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<label htmlFor="w-full" className="text-sm font-medium">
										Full Image URL <span className="text-destructive">*</span>
									</label>
									<Input
										id="w-full"
										placeholder="https://example.com/full.jpg"
										value={form.fullUrl}
										onChange={(e) => setForm({ ...form, fullUrl: e.target.value })}
									/>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<label htmlFor="w-download" className="text-sm font-medium">
										Download URL{" "}
										<span className="font-normal text-muted-foreground">(defaults to full)</span>
									</label>
									<Input
										id="w-download"
										placeholder="https://example.com/download.jpg"
										value={form.downloadUrl}
										onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
									/>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<label htmlFor="w-desc" className="text-sm font-medium">
										Description
									</label>
									<Input
										id="w-desc"
										placeholder="Optional description"
										value={form.description}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
									/>
								</div>
								<div className="mt-2 flex justify-end gap-2 sm:col-span-2">
									<Button type="button" variant="ghost" onClick={toggleForm}>
										Cancel
									</Button>
									<Button type="submit" disabled={uploading}>
										{uploading ? (
											<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
										) : (
											<Plus className="mr-1.5 h-4 w-4" />
										)}
										Upload
									</Button>
								</div>
							</form>

							<aside className="hidden lg:block">
								<div className="sticky top-20">
									<p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
										Preview
									</p>
									<div className="overflow-hidden rounded-xl border border-border/40 bg-muted/40">
										<div className="relative aspect-video">
											{form.thumbUrl ? (
												/* eslint-disable-next-line @next/next/no-img-element */
												<img
													src={form.thumbUrl}
													alt="Preview"
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center">
													<Image className="h-8 w-8 text-muted-foreground/40" />
												</div>
											)}
										</div>
										<div className="border-t border-border/40 bg-card px-4 py-3">
											<p className="truncate text-sm font-medium">
												{form.title || "Untitled wallpaper"}
											</p>
											<p className="mt-0.5 truncate text-xs text-muted-foreground">
												{form.author || "Unknown author"} · {form.width}×{form.height}
											</p>
										</div>
									</div>
								</div>
							</aside>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="relative mt-10">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-xl font-semibold tracking-tighter">Collection</h2>
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search title, author…"
							className="pl-9"
						/>
					</div>
				</div>

				<div className="mt-6">
					{loading ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
								<Skeleton key={key} className="aspect-video w-full rounded-xl" />
							))}
						</div>
					) : visibleWallpapers.length === 0 ? (
						<div className="rounded-xl border border-dashed border-border/60 py-20 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
								<Image className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="mt-4 text-sm font-medium">
								{wallpapers.length === 0 ? "No wallpapers yet" : "Nothing matches your filters"}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{wallpapers.length === 0
									? "Upload your first wallpaper to start building your collection."
									: "Try a different search or category."}
							</p>
							{wallpapers.length === 0 && (
								<Button onClick={toggleForm} size="sm" className="mt-5">
									<Plus className="mr-1.5 h-4 w-4" />
									Add Wallpaper
								</Button>
							)}
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{visibleWallpapers.map((w) => (
								<div
									key={w.id}
									className="group overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-border"
								>
									<div className="relative aspect-video overflow-hidden bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={w.thumbUrl}
											alt={w.title}
											loading="lazy"
											className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
										<div className="absolute right-2 top-2 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 bg-black/40 text-white backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
												onClick={() => handleDelete(w.id)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
										<div className="absolute bottom-2.5 left-2.5 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
											<Badge className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
												{categoryLabel(w.category)}
											</Badge>
										</div>
									</div>
									<div className="px-3.5 py-3">
										<p className="truncate text-sm font-medium">{w.title}</p>
										<p className="mt-0.5 truncate text-xs text-muted-foreground">
											{w.author} · {w.width}×{w.height}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
