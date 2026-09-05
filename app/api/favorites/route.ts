import { NextResponse } from "next/server"
import { z } from "zod"

import { addFavorite, listFavorites } from "@/db/queries/favorites"

export const dynamic = "force-dynamic"

const favoriteSchema = z.object({
	deviceId: z.string().min(1).max(128),
	item: z.object({
		id: z.string().min(1),
		source: z.enum(["picsum", "nekos", "ghibli"]),
		title: z.string(),
		author: z.string(),
		thumb: z.string().url(),
		full: z.string().url(),
		download: z.string().url(),
		width: z.number().int().positive(),
		height: z.number().int().positive(),
		tags: z.array(z.string()).default([]),
	}),
})

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const deviceId = searchParams.get("deviceId")
	if (!deviceId) {
		return NextResponse.json({ error: "deviceId is required" }, { status: 400 })
	}
	try {
		const items = await listFavorites(deviceId)
		return NextResponse.json({ items })
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Failed to load favorites" },
			{ status: 500 },
		)
	}
}

export async function POST(request: Request) {
	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
	}
	const parsed = favoriteSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid payload", details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const { deviceId, item } = parsed.data
	const result = await addFavorite(deviceId, item)
	if (!result.ok) {
		return NextResponse.json({ error: result.error }, { status: 500 })
	}
	return NextResponse.json({ ok: true })
}
