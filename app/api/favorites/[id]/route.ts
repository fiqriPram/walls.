import { NextResponse } from "next/server"
import { z } from "zod"

import { removeFavorite } from "@/db/queries/favorites"

export const dynamic = "force-dynamic"

const schema = z.object({
	deviceId: z.string().min(1).max(128),
	source: z.string().min(1),
	externalId: z.string().min(1),
})

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url)
	const parsed = schema.safeParse({
		deviceId: searchParams.get("deviceId"),
		source: searchParams.get("source"),
		externalId: searchParams.get("externalId"),
	})
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid query" }, { status: 400 })
	}
	const result = await removeFavorite(
		parsed.data.deviceId,
		parsed.data.source,
		parsed.data.externalId,
	)
	if (!result.ok) {
		return NextResponse.json({ error: result.error }, { status: 500 })
	}
	return NextResponse.json({ ok: true })
}
