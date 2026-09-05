import { ImageIcon } from "lucide-react"

interface EmptyStateProps {
	title?: string
	description?: string
}

export function EmptyState({
	title = "No wallpapers found",
	description = "Try a different search or category.",
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60">
				<ImageIcon className="h-5 w-5 text-muted-foreground" />
			</div>
			<div>
				<p className="font-medium">{title}</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</div>
	)
}
