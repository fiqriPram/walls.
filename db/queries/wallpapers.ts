import { and, eq, ilike, or, sql } from "drizzle-orm"

import { db } from "@/db"
import { wallpapers } from "@/db/schema"
import type { FetchResult, WallpaperItem } from "@/lib/types"

interface ListParams {
	category: string
	page: number
	limit: number
	search?: string
}

function toWallpaperItem(row: typeof wallpapers.$inferSelect): WallpaperItem {
	return {
		id: String(row.id),
		source: "upload",
		title: row.title,
		author: row.author,
		thumb: row.thumbUrl,
		full: row.fullUrl,
		download: row.downloadUrl,
		width: row.width,
		height: row.height,
		tags: row.tags ?? [],
		description: row.description ?? undefined,
	}
}

export async function listWallpapers(params: ListParams): Promise<FetchResult> {
	if (!process.env.DATABASE_URL) {
		return { items: [], hasMore: false, total: 0 }
	}

	const { category, page, limit, search } = params
	const conditions = []

	if (category && category !== "all") {
		conditions.push(eq(wallpapers.category, category))
	}

	if (search) {
		const q = `%${search}%`
		conditions.push(
			or(
				ilike(wallpapers.title, q),
				ilike(wallpapers.author, q),
				ilike(wallpapers.description, q),
				sql`EXISTS (SELECT 1 FROM unnest(${wallpapers.tags}) AS tag WHERE tag ILIKE ${q})`,
			),
		)
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined

	const countResult = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(wallpapers)
		.where(where)
	const total = countResult[0]?.count ?? 0

	const start = (page - 1) * limit
	const rows = await db
		.select()
		.from(wallpapers)
		.where(where)
		.orderBy(sql`${wallpapers.createdAt} DESC`)
		.limit(limit)
		.offset(start)

	return {
		items: rows.map(toWallpaperItem),
		hasMore: start + limit < total,
		total,
	}
}

export async function getWallpaper(id: number): Promise<WallpaperItem | null> {
	if (!process.env.DATABASE_URL) return null
	const rows = await db.select().from(wallpapers).where(eq(wallpapers.id, id)).limit(1)
	return rows[0] ? toWallpaperItem(rows[0]) : null
}
