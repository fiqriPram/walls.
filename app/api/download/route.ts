import { NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const querySchema = z.object({
	url: z.string().url().max(2048),
	filename: z.string().min(1).max(200),
})

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const parsed = querySchema.safeParse({
		url: searchParams.get("url") ?? undefined,
		filename: searchParams.get("filename") ?? undefined,
	})

	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid query" }, { status: 400 })
	}

	let target: URL
	try {
		target = new URL(parsed.data.url)
	} catch {
		return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
	}

	try {
		const upstream = await fetch(target.toString(), {
			headers: { Accept: "image/*" },
		})
		if (!upstream.ok) {
			return NextResponse.json({ error: `Upstream error: ${upstream.status}` }, { status: 500 })
		}
		const contentType = upstream.headers.get("content-type") ?? "image/jpeg"
		const buffer = await upstream.arrayBuffer()
		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${parsed.data.filename.replace(/"/g, "")}"`,
				"Cache-Control": "public, max-age=3600",
			},
		})
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Download failed" },
			{ status: 500 },
		)
	}
}
