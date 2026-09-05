"use client"

import { useCallback, useEffect, useState } from "react"

import { getPrimarySource } from "@/lib/categories"
import { CONFIG } from "@/lib/config"
import { getSource } from "@/lib/sources"
import type { WallpaperItem } from "@/lib/types"

export interface UseWallpapersOptions {
	category?: string
	search?: string
	initialPage?: number
}

export interface UseWallpapersResult {
	items: WallpaperItem[]
	isLoading: boolean
	isLoadingMore: boolean
	error: string | null
	hasMore: boolean
	page: number
	loadMore: () => Promise<void>
	refresh: () => Promise<void>
}

async function fetchPage(
	category: string,
	page: number,
	limit: number,
	search?: string,
): Promise<{ items: WallpaperItem[]; hasMore: boolean }> {
	const sourceId = getPrimarySource(category) ?? "picsum"
	const source = getSource(sourceId)
	if (!source) {
		return { items: [], hasMore: false }
	}
	const result = await source.fetch({ category, page, limit, search })
	return { items: result.items, hasMore: result.hasMore }
}

export function useWallpapers(options: UseWallpapersOptions = {}): UseWallpapersResult {
	const { category = CONFIG.defaultCategory, search = "", initialPage = 1 } = options

	const [items, setItems] = useState<WallpaperItem[]>([])
	const [page, setPage] = useState(initialPage)
	const [hasMore, setHasMore] = useState(true)
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const load = useCallback(
		async (pageNum: number, append: boolean) => {
			try {
				if (append) setIsLoadingMore(true)
				else setIsLoading(true)
				setError(null)
				const { items: newItems, hasMore: more } = await fetchPage(
					category,
					pageNum,
					CONFIG.itemsPerPage,
					search,
				)
				setHasMore(more)
				setItems((prev) => (append ? [...prev, ...newItems] : newItems))
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to load")
			} finally {
				setIsLoading(false)
				setIsLoadingMore(false)
			}
		},
		[category, search],
	)

	useEffect(() => {
		setItems([])
		setPage(1)
		setHasMore(true)
		void load(1, false)
	}, [load])

	const loadMore = useCallback(async () => {
		if (isLoading || isLoadingMore || !hasMore) return
		const next = page + 1
		setPage(next)
		await load(next, true)
	}, [hasMore, isLoading, isLoadingMore, load, page])

	const refresh = useCallback(async () => {
		setItems([])
		setPage(1)
		setHasMore(true)
		await load(1, false)
	}, [load])

	return { items, isLoading, isLoadingMore, error, hasMore, page, loadMore, refresh }
}
