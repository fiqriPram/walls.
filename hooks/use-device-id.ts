"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "walls-device-id"

function generateId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID()
	}
	return `dev-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export function getDeviceId(): string {
	if (typeof window === "undefined") return "ssr"
	let id = window.localStorage.getItem(STORAGE_KEY)
	if (!id) {
		id = generateId()
		window.localStorage.setItem(STORAGE_KEY, id)
	}
	return id
}

export function useDeviceId(): string {
	const [id, setId] = useState<string>("ssr")
	useEffect(() => {
		setId(getDeviceId())
	}, [])
	return id
}
