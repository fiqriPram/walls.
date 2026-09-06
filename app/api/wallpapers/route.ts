import { NextResponse } from "next/server"
import { z } from "zod"

import { listWallpapers } from "@/db/queries/wallpapers"

export const dynamic = "force-dynamic"

const querySchema = z.object({
	category: z.string().min(1).max(50),
	page: z.coerce.number().int().min(1).max(1000).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(30),
	search: z.string().max(100).optional(),
})

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const parsed = querySchema.safeParse({
		category: searchParams.get("category") ?? undefined,
		page: searchParams.get("page") ?? undefined,
		limit: searchParams.get("limit") ?? undefined,
		search: searchParams.get("search") ?? undefined,
	})

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid query", details: parsed.error.flatten() },
			{ status: 400 },
		)
	}

	const { category, page, limit, search } = parsed.data

	try {
		const result = await listWallpapers({ category, page, limit, search })
		return NextResponse.json(result)
	} catch (e) {
		const message = e instanceof Error ? e.message : "Failed to fetch"
		return NextResponse.json({ error: message }, { status: 502 })
	}
}
