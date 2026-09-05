"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface LoadMoreProps {
	onClick: () => void
	isLoading: boolean
	hasMore: boolean
}

export function LoadMore({ onClick, isLoading, hasMore }: LoadMoreProps) {
	if (!hasMore) return null
	return (
		<div className="flex justify-center pt-6">
			<Button onClick={onClick} disabled={isLoading} variant="outline" size="lg">
				{isLoading ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading...
					</>
				) : (
					"Load more"
				)}
			</Button>
		</div>
	)
}
