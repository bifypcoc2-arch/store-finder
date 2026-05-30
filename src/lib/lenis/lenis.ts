import Lenis from "@studio-freight/lenis"

let lenis: Lenis | null = null

export function getLenis() {
	if (typeof window === "undefined") return null
	if (lenis) return lenis

	lenis = new Lenis({
		lerp: 0.12,
		wheelMultiplier: 0.9,
		smoothWheel: true,
	})

	return lenis
}