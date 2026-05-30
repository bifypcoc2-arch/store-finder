"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"

export function TransitionCurtain() {
	const curtainRef = useRef<HTMLDivElement | null>(null)
	const pathname = usePathname()

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = curtainRef.current
		if (!el) return

		// initial hidden
		gsap.set(el, { yPercent: 110, opacity: 1 })
	}, [])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = curtainRef.current
		if (!el) return

		// Simple transition stub: flash curtain on route change.
		// Later we can wire this to a custom navigation function.
		const tl = gsap.timeline()
		tl.to(el, { yPercent: 0, duration: 0.35, ease: "power4.inOut" })
			.to(el, { yPercent: -110, duration: 0.45, ease: "power4.inOut" }, "+=0.05")
			.set(el, { yPercent: 110 })

		return () => tl.kill()
	}, [pathname])

	return (
		<div
			ref={curtainRef}
			className="pointer-events-none fixed inset-0 z-[9998] bg-neutral-950"
			aria-hidden
		/>
	)
}
