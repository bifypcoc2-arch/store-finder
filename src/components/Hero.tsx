"use client"

import { useEffect, useRef, useState } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

export function Hero() {
	const rootRef = useRef<HTMLElement | null>(null)
	const searchWrapRef = useRef<HTMLDivElement | null>(null)

	const [query, setQuery] = useState("")

	useEffect(() => {
		const { gsap } = ensureGsap()
		const root = rootRef.current
		const searchWrap = searchWrapRef.current
		if (!root || !searchWrap) return

		gsap.set(searchWrap, { clipPath: "inset(50% 0% 50% 0%)" })

		const tl = gsap.timeline()
		tl.fromTo(
			"[data-hero-char]",
			{ y: 36, opacity: 0 },
			{
				y: 0,
				opacity: 1,
				stagger: 0.03,
				duration: 0.7,
				ease: "power3.out",
			},
		).to(
			searchWrap,
			{
				clipPath: "inset(0% 0% 0% 0%)",
				duration: 0.7,
				ease: "power4.inOut",
			},
			"-=0.25",
		)

		return () => {
			tl.kill()
		}
	}, [])

	return (
		<section
			ref={rootRef}
			className="relative min-h-screen overflow-hidden bg-neutral-950 text-white"
		>
			{/* placeholder for WebGL canvas */}
			<div className="absolute inset-0 opacity-40">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(120,180,255,0.14),transparent_55%)]" />
			</div>

			<div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 md:pt-28">
				<h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
					{"Store Finder".split("").map((ch, i) => (
						<span
							// eslint-disable-next-line react/no-array-index-key
							key={i}
							data-hero-char
							className="inline-block will-change-transform"
						>
							{ch === " " ? "\u00A0" : ch}
						</span>
					))}
				</h1>

				<p className="mt-5 max-w-xl text-white/70">
					Type a city or category — we’ll fetch places from Overpass and render
					results.
				</p>

				<div ref={searchWrapRef} className="mt-10 will-change-[clip-path]">
					<div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur px-5 py-4">
						<form
							onSubmit={(e) => {
								e.preventDefault()
								alert(`Search: ${query}`)
							}}
						>
							<label className="block text-sm text-white/60">Search</label>
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="mt-2 w-full bg-transparent outline-none text-lg placeholder:text-white/30"
								placeholder="Berlin, coffee, supermarket…"
							/>
						</form>
					</div>
				</div>

				<div className="mt-14 text-white/60 text-sm">Scroll ↓</div>
			</div>
		</section>
	)
}