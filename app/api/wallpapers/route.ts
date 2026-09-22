import { NextResponse } from "next/server"
import { z } from "zod"

import { getCategory } from "@/lib/categories"
import { getSource } from "@/lib/sources"
import type { FetchResult } from "@/lib/types"

export const dynamic = "force-dynamic"

const querySchema = z.object({
	category: z.string().min(1).max(50),
	page: z.coerce.number().int().min(1).max(1000).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(30),
	search: z.string().max(100).optional(),
	source: z.string().max(20).optional(),
})

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const parsed = querySchema.safeParse({
		category: searchParams.get("category") ?? undefined,
		page: searchParams.get("page") ?? undefined,
		limit: searchParams.get("limit") ?? undefined,
		search: searchParams.get("search") ?? undefined,
		source: searchParams.get("source") ?? undefined,
	})

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid query", details: parsed.error.flatten() },
			{ status: 400 },
		)
	}

	const { category, page, limit, search, source } = parsed.data

	try {
		if (source) {
			const single = getSource(source)
			if (!single) {
				return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 })
			}
			const result = await single.fetch({ category, page, limit, search })
			return NextResponse.json(result)
		}

		const cat = getCategory(category)
		if (!cat) {
			return NextResponse.json({ error: `Unknown category: ${category}` }, { status: 400 })
		}

		// Fan out to every source registered for this category, splitting the
		// page budget evenly. One failing source must not break the whole page.
		const perSource = Math.max(1, Math.ceil(limit / cat.sources.length))
		const settled = await Promise.allSettled(
			cat.sources.map((id) => {
				const s = getSource(id)
				if (!s) throw new Error(`Unknown source: ${id}`)
				return s.fetch({ category, page, limit: perSource, search })
			}),
		)

		const items: FetchResult["items"] = []
		let hasMore = false
		let total = 0
		for (const r of settled) {
			if (r.status === "fulfilled") {
				items.push(...r.value.items)
				hasMore = hasMore || r.value.hasMore
				total += r.value.total ?? r.value.items.length
			} else {
				console.error(`[wallpapers] source failed: ${r.reason}`)
			}
		}

		return NextResponse.json({ items, hasMore, total })
	} catch (e) {
		const message = e instanceof Error ? e.message : "Failed to fetch"
		return NextResponse.json({ error: message }, { status: 502 })
	}
}
