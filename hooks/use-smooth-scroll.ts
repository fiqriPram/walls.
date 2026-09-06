"use client"

import { gsap } from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useCallback } from "react"

gsap.registerPlugin(ScrollToPlugin)

interface SmoothScrollOptions {
	duration?: number
	offset?: number
	easing?: string
}

export function useSmoothScroll() {
	const scrollTo = useCallback((target: string | number, options: SmoothScrollOptions = {}) => {
		const { duration = 1.2, offset = 0, easing = "power3.inOut" } = options

		gsap.to(window, {
			scrollTo: { y: target, offsetY: offset },
			duration,
			easing,
		})
	}, [])

	return { scrollTo }
}
