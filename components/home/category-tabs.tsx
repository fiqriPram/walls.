"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES } from "@/lib/categories"

interface CategoryTabsProps {
	value: string
	onChange: (value: string) => void
}

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
	return (
		<Tabs value={value} onValueChange={onChange} className="w-full">
			<div className="overflow-x-auto">
				<TabsList className="inline-flex h-10 w-max">
					{CATEGORIES.map((c) => (
						<TabsTrigger key={c.id} value={c.id} className="px-4">
							{c.label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</Tabs>
	)
}
