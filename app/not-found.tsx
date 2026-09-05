import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
	return (
		<div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
			<p className="text-6xl font-semibold">404</p>
			<h2 className="mt-3 text-2xl font-semibold">Page not found</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				The page you are looking for does not exist.
			</p>
			<Button asChild className="mt-6">
				<Link href="/">Go home</Link>
			</Button>
		</div>
	)
}
