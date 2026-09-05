import { and, desc, eq } from "drizzle-orm"

import type { WallpaperItem } from "@/lib/types"
import { db, schema } from ".."

export type FavoriteRow = {
	id: number
	externalId: string
	source: string
	title: string
	author: string
	thumbUrl: string
	fullUrl: string
	downloadUrl: string
	width: number
	height: number
	deviceId: string
	createdAt: Date
}

function toWallpaperItem(row: FavoriteRow): WallpaperItem {
	return {
		id: row.externalId,
		source: row.source as WallpaperItem["source"],
		title: row.title,
		author: row.author,
		thumb: row.thumbUrl,
		full: row.fullUrl,
		download: row.downloadUrl,
		width: row.width,
		height: row.height,
		tags: [],
	}
}

export async function listFavorites(deviceId: string): Promise<WallpaperItem[]> {
	if (!process.env.DATABASE_URL) return []
	const rows = await db
		.select()
		.from(schema.favorites)
		.where(eq(schema.favorites.deviceId, deviceId))
		.orderBy(desc(schema.favorites.createdAt))
	return rows.map(toWallpaperItem)
}

export async function isFavorited(
	deviceId: string,
	source: string,
	externalId: string,
): Promise<boolean> {
	if (!process.env.DATABASE_URL) return false
	const rows = await db
		.select({ id: schema.favorites.id })
		.from(schema.favorites)
		.where(
			and(
				eq(schema.favorites.deviceId, deviceId),
				eq(schema.favorites.source, source),
				eq(schema.favorites.externalId, externalId),
			),
		)
		.limit(1)
	return rows.length > 0
}

export async function addFavorite(
	deviceId: string,
	item: WallpaperItem,
): Promise<{ ok: true } | { ok: false; error: string }> {
	if (!process.env.DATABASE_URL) {
		return { ok: false, error: "Database not configured" }
	}
	try {
		await db
			.insert(schema.favorites)
			.values({
				deviceId,
				externalId: item.id,
				source: item.source,
				title: item.title,
				author: item.author,
				thumbUrl: item.thumb,
				fullUrl: item.full,
				downloadUrl: item.download,
				width: item.width,
				height: item.height,
			})
			.onConflictDoNothing()
		return { ok: true }
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
	}
}

export async function removeFavorite(
	deviceId: string,
	source: string,
	externalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
	if (!process.env.DATABASE_URL) {
		return { ok: false, error: "Database not configured" }
	}
	try {
		await db
			.delete(schema.favorites)
			.where(
				and(
					eq(schema.favorites.deviceId, deviceId),
					eq(schema.favorites.source, source),
					eq(schema.favorites.externalId, externalId),
				),
			)
		return { ok: true }
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
	}
}
