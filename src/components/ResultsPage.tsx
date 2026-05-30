"use client"

import { useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"

type Card = {
	name: string
	distanceKm: number
	city: string
}

export function ResultsPage() {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const searchParams = useSearchParams()
	const q = searchParams.get("q") ?? ""

	const cards = useMemo<Card[]>(
		() => [
			{ name: "Kaffeekult", distanceKm: 1.2, city: "Berlin" },
			{ name: "Market 24", distanceKm: 2.8, city: "Berlin" },
			{ name: "Green Deli", distanceKm: 0.7, city: "Berlin" },
			{ name: "Coffee Lab", distanceKm: 3.4, city: "Berlin" },
			{ name: "SuperMart", distanceKm: 5.1, city: "Berlin" },
			{ name: "Bakery & Co", distanceKm: 1.9, city: "Berlin" },
		],
		[],
	)

	useEffect(() => {
		const { gsap } = ensureGsap()
		const root = rootRef.current
		if (!root) return

		const ctx = gsap.context(() => {
			gsap.fromTo(
				"[data-result-card]",
				{ y: 80, opacity: 0, scale: 0.96 },
				{
					y: 0,
					opacity: 1,
					scale: 1,
					duration: 0.7,
					ease: "power3.out",
					stagger: 0.06,
				},
			)
		}, root)

		return () => ctx.revert()
	}, [])

	return (
		<div ref={rootRef} className="min-h-screen bg-neutral-950 text-white">
			<div className="mx-auto max-w-6xl px-6 pt-28 pb-10">
				<div className="text-white/60 text-sm tracking-[0.22em]">RESULTS</div>
				<h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-[1.05]">
					{q ? (
						<>
							Search results for <span className="text-white">“{q}”</span>
						</>
					) : (
						"Search results"
					)}
				</h1>
				<p className="mt-4 text-white/60">
					Cards + Flip transitions + map will live here.
				</p>
			</div>

			<div className="mx-auto max-w-6xl px-6 pb-24">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{cards.map((c) => (
						<button
							key={c.name}
							type="button"
							data-result-card
							className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-left transition hover:bg-white/[0.07]"
						>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
								<div className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.10),transparent_55%)]" />
							</div>

							<div className="relative">
								<div className="text-white/50 text-xs tracking-[0.18em]">
									{c.city.toUpperCase()}
								</div>
								<div className="mt-2 text-xl font-semibold">
									<span className="relative">
										{c.name}
										<span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
									</span>
								</div>
								<div className="mt-3 text-white/60">
									{c.distanceKm.toFixed(1)} km away
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
