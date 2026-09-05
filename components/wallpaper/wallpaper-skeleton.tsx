import { Skeleton } from "@/components/ui/skeleton"

export function WallpaperSkeleton({ count = 12 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={`skeleton-${i}-${count}`}
					className="overflow-hidden rounded-xl border border-border/40"
				>
					<Skeleton className="aspect-video w-full" />
					<div className="space-y-2 p-3">
						<Skeleton className="h-3 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	)
}
