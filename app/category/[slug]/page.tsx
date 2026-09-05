import { notFound } from "next/navigation"

import { WallpaperCategoryView } from "@/components/home/wallpaper-category-view"
import { categoryExists, getCategory } from "@/lib/categories"

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	if (!categoryExists(slug)) notFound()
	const cat = getCategory(slug)
	if (!cat) notFound()

	return <WallpaperCategoryView categoryId={cat.id} label={cat.label} />
}
