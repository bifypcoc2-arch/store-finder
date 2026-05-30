"use client"

import { useEffect } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"
import { getLenis } from "@/lib/lenis/lenis"
import { syncLenisWithScrollTrigger } from "@/lib/lenis/syncScrollTrigger"

export function AnimationRuntime() {
	useEffect(() => {
		ensureGsap()

		const lenis = getLenis()
		if (!lenis) return

		const cleanupSync = syncLenisWithScrollTrigger(lenis)

		return () => {
			cleanupSync()
		}
	}, [])

	return null
}