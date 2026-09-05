"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
	value: string
	onChange: (v: string) => void
	placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
	return (
		<div className="relative flex items-center w-full max-w-md">
			<Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-9 pr-9"
			/>
			{value && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-1 h-7 w-7"
					onClick={() => onChange("")}
					aria-label="Clear search"
				>
					<X className="h-3.5 w-3.5" />
				</Button>
			)}
		</div>
	)
}
