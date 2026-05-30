"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"
import { useUiStore } from "@/lib/store/ui"

export function TransitionCurtain() {
	const curtainRef = useRef<HTMLDivElement | null>(null)
	const router = useRouter()
	const isTransitioning = useUiStore((s) => s.isTransitioning)
	const setTransitioning = useUiStore((s) => s.setTransitioning)

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = curtainRef.current
		if (!el) return
		gsap.set(el, { yPercent: 110, opacity: 1 })
	}, [])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = curtainRef.current
		if (!el) return

		let tl: gsap.core.Timeline | null = null

		const onNavigate = (e: Event) => {
			const detail = (e as CustomEvent).detail as { url: string } | undefined
			const url = detail?.url
			if (!url) return

			// if already animating, ignore
			if (tl) return

			tl = gsap.timeline({
				onComplete: () => {
					tl = null
					setTransitioning(false)
				},
			})

			// curtain in
			tl.set(el, { yPercent: 110 })
				.to(el, { yPercent: 0, duration: 0.35, ease: "power4.inOut" })
				.add(() => {
					// navigate while covered
					router.push(url)
				})
				// curtain out
				.to(el, { yPercent: -110, duration: 0.45, ease: "power4.inOut" }, "+=0.05")
				.set(el, { yPercent: 110 })
		}

		window.addEventListener("sf:navigate", onNavigate as EventListener)
		return () => window.removeEventListener("sf:navigate", onNavigate as EventListener)
	}, [router, setTransitioning])

	return (
		<div
			ref={curtainRef}
			className={
				"pointer-events-none fixed inset-0 z-[9998] bg-neutral-950 " +
				(isTransitioning ? "opacity-100" : "opacity-100")
			}
			aria-hidden
		/>
	)
}
