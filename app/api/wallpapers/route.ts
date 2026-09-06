import { NextResponse } from "next/server"
import { z } from "zod"

import { getSource } from "@/lib/sources"
import type { FetchParams } from "@/lib/types"

export const dynamic = "force-dynamic"

const querySchema = z.object({
	source: z.enum(["picsum", "ghibli"]),
	category: z.string().min(1).max(50),
	page: z.coerce.number().int().min(1).max(1000).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(30),
	search: z.string().max(100).optional(),
})

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const parsed = querySchema.safeParse({
		source: searchParams.get("source") ?? undefined,
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

	const { source, category, page, limit, search } = parsed.data
	const sourceImpl = getSource(source)
	if (!sourceImpl) {
		return NextResponse.json({ error: "Unknown source" }, { status: 400 })
	}
	if (!sourceImpl.categories.includes(category) && category !== "all") {
		return NextResponse.json(
			{ error: `Category "${category}" not supported by source "${source}"` },
			{ status: 400 },
		)
	}

	try {
		const params: FetchParams = { category, page, limit, search }
		const result = await sourceImpl.fetch(params)
		return NextResponse.json(result)
	} catch (e) {
		const message = e instanceof Error ? e.message : "Failed to fetch"
		return NextResponse.json({ error: message }, { status: 502 })
	}
}
