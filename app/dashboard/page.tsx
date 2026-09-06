"use client"

import { Image, Loader2, LogOut, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"
import { CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"

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

export default function DashboardPage() {
	const router = useRouter()
	const [wallpapers, setWallpapers] = useState<WallpaperEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [showForm, setShowForm] = useState(false)

	const [form, setForm] = useState(EMPTY_FORM)

	const { data: session } = authClient.useSession()

	const fetchWallpapers = useCallback(async () => {
		try {
			const res = await fetch("/api/upload")
			if (res.status === 401) {
				router.push("/login")
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
			router.push("/login")
			return
		}
		fetchWallpapers()
	}, [session, router, fetchWallpapers])

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
			toast.success("Deleted")
			fetchWallpapers()
		} catch {
			toast.error("Failed to delete")
		}
	}

	const handleLogout = async () => {
		await authClient.signOut()
		router.push("/login")
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	const totalCategories = CATEGORIES.filter((c) => c.id !== "all").length
	const showPreview = Boolean(form.thumbUrl)

	return (
		<div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:py-12">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tighter sm:text-3xl">Dashboard</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{session?.user?.name ? (
							<span>
								Welcome back,{" "}
								<span className="font-medium text-foreground">{session.user.name}</span>.
							</span>
						) : null}{" "}
						Manage your wallpaper collection.
					</p>
				</div>
				<Button onClick={handleLogout} variant="ghost" size="sm">
					<LogOut className="mr-1.5 h-4 w-4" />
					Logout
				</Button>
			</div>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Wallpapers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold tracking-tighter">{wallpapers.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold tracking-tighter">{totalCategories}</p>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8 flex items-center justify-between">
				<h2 className="text-lg font-medium tracking-tight">Collection</h2>
				<Button onClick={() => setShowForm(!showForm)} size="sm">
					<Plus className="mr-1.5 h-4 w-4" />
					Add Wallpaper
				</Button>
			</div>

			{showForm && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle className="text-base">Upload Wallpaper</CardTitle>
					</CardHeader>
					<CardContent>
						{showPreview && (
							<div className="mb-5 flex justify-center rounded-lg border border-border/40 bg-muted/40 p-3">
								<div className="relative aspect-video w-40 overflow-hidden rounded-md">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={form.thumbUrl}
										alt="Thumbnail preview"
										className="h-full w-full object-cover"
									/>
								</div>
							</div>
						)}
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label htmlFor="w-title" className="text-sm font-medium">
									Title *
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
										{CATEGORIES.filter((c) => c.id !== "all").map((c) => (
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
							<div className="space-y-2 sm:col-span-2">
								<label htmlFor="w-thumb" className="text-sm font-medium">
									Thumbnail URL *
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
									Full Image URL *
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
									Download URL (defaults to Full URL)
								</label>
								<Input
									id="w-download"
									placeholder="https://example.com/download.jpg"
									value={form.downloadUrl}
									onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="w-width" className="text-sm font-medium">
									Width
								</label>
								<Input
									id="w-width"
									type="number"
									value={form.width}
									onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="w-height" className="text-sm font-medium">
									Height
								</label>
								<Input
									id="w-height"
									type="number"
									value={form.height}
									onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
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
						</div>
						<div className="mt-6 flex justify-end gap-2">
							<Button variant="ghost" onClick={() => setShowForm(false)}>
								Cancel
							</Button>
							<Button onClick={handleUpload} disabled={uploading}>
								{uploading ? (
									<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
								) : (
									<Plus className="mr-1.5 h-4 w-4" />
								)}
								Upload
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="mt-6">
				{wallpapers.length === 0 ? (
					<div className="rounded-xl border border-border/40 bg-card/50 p-12 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
							<Image className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="mt-4 text-sm font-medium">No wallpapers yet</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Click &quot;Add Wallpaper&quot; to get started.
						</p>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{wallpapers.map((w) => {
							const categoryLabel = CATEGORIES.find((c) => c.id === w.category)?.label ?? w.category
							return (
								<div
									key={w.id}
									className="group overflow-hidden rounded-xl border border-border/40 bg-card transition-colors hover:border-border"
								>
									<div className="relative aspect-video overflow-hidden bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={w.thumbUrl}
											alt={w.title}
											className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
										<div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
											<Button
												variant="destructive"
												size="icon"
												className="h-7 w-7"
												onClick={() => handleDelete(w.id)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
										<div className="absolute bottom-2 left-2">
											<Badge
												variant="outline"
												className={cn("border-white/20 bg-black/30 text-white/90")}
											>
												{categoryLabel}
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
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
