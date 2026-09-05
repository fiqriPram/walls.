"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
			<h2 className="text-2xl font-semibold">Something went wrong</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				{error.message || "An unexpected error occurred."}
			</p>
			<Button onClick={reset} className="mt-6">
				Try again
			</Button>
		</div>
	)
}
