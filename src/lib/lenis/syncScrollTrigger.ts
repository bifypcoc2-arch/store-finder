import type Lenis from "@studio-freight/lenis"
import { ensureGsap } from "@/lib/gsap/gsap"

let rafId: number | null = null

export function syncLenisWithScrollTrigger(lenis: Lenis) {
	const { ScrollTrigger } = ensureGsap()

	// Lenis -> ScrollTrigger
	lenis.on("scroll", ScrollTrigger.update)

	// Main RAF
	const raf = (time: number) => {
		lenis.raf(time)
		rafId = requestAnimationFrame(raf)
	}
	rafId = requestAnimationFrame(raf)

	// Cleanup
	return () => {
		if (rafId) cancelAnimationFrame(rafId)
		rafId = null
		lenis.off("scroll", ScrollTrigger.update)
	}
}