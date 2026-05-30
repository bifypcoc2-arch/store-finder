import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Flip } from "gsap/Flip"

let isRegistered = false

export function ensureGsap() {
	if (typeof window === "undefined") return { gsap, ScrollTrigger, Flip }
	if (isRegistered) return { gsap, ScrollTrigger, Flip }

	gsap.registerPlugin(ScrollTrigger, Flip)
	gsap.defaults({ ease: "power2.out", duration: 0.6 })

	isRegistered = true
	return { gsap, ScrollTrigger, Flip }
}