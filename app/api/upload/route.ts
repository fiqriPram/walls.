import { eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { wallpapers } from "@/db/schema"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const uploadSchema = z.object({
	title: z.string().min(1).max(200),
	author: z.string().min(1).max(200),
	category: z.string().min(1).max(50),
	thumbUrl: z.string().url(),
	fullUrl: z.string().url(),
	downloadUrl: z.string().url(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	tags: z.array(z.string()).default([]),
	description: z.string().max(500).optional(),
})

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
	}

	const parsed = uploadSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid payload", details: parsed.error.flatten() },
			{ status: 400 },
		)
	}

	const data = parsed.data
	const externalId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

	try {
		await db.insert(wallpapers).values({
			externalId,
			title: data.title,
			author: data.author,
			category: data.category,
			thumbUrl: data.thumbUrl,
			fullUrl: data.fullUrl,
			downloadUrl: data.downloadUrl,
			width: data.width,
			height: data.height,
			tags: data.tags,
			description: data.description,
		})

		return NextResponse.json({ ok: true, externalId })
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Upload failed" },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")
	if (!id) {
		return NextResponse.json({ error: "id is required" }, { status: 400 })
	}

	try {
		await db.delete(wallpapers).where(eq(wallpapers.id, Number(id)))
		return NextResponse.json({ ok: true })
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Delete failed" },
			{ status: 500 },
		)
	}
}

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(wallpapers)
		const total = countResult[0]?.count ?? 0
		return NextResponse.json({ total })
	} catch (e) {
		return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 })
	}
}
