export async function downloadImage(url: string, filename: string): Promise<void> {
	try {
		const response = await fetch(url, { mode: "cors" })
		if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
		const blob = await response.blob()
		const objectUrl = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = objectUrl
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(objectUrl)
	} catch {
		window.open(url, "_blank", "noopener,noreferrer")
	}
}

export function safeFilename(title: string, source: string, id: string): string {
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "")
		.slice(0, 40)
	return `${slug || source}-${id}.jpg`
}
