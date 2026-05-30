"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"
import { ResultsDetailOverlay } from "@/components/ResultsDetailOverlay"

type Category = "All" | "Coffee" | "Market" | "Food"

type Card = {
	name: string
	distanceKm: number
	city: string
	category: Exclude<Category, "All">
}

export function ResultsPage() {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const gridRef = useRef<HTMLDivElement | null>(null)
	const searchParams = useSearchParams()
	const q = searchParams.get("q") ?? ""

	const allCards = useMemo<Card[]>(
		() => [
			{ name: "Kaffeekult", distanceKm: 1.2, city: "Berlin", category: "Coffee" },
			{ name: "Market 24", distanceKm: 2.8, city: "Berlin", category: "Market" },
			{ name: "Green Deli", distanceKm: 0.7, city: "Berlin", category: "Food" },
			{ name: "Coffee Lab", distanceKm: 3.4, city: "Berlin", category: "Coffee" },
			{ name: "SuperMart", distanceKm: 5.1, city: "Berlin", category: "Market" },
			{ name: "Bakery & Co", distanceKm: 1.9, city: "Berlin", category: "Food" },
		],
		[],
	)

	const [filter, setFilter] = useState<Category>("All")
	const [selected, setSelected] = useState<Card | null>(null)

	const cards = useMemo(() => {
		if (filter === "All") return allCards
		return allCards.filter((c) => c.category === filter)
	}, [allCards, filter])

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
					duration: 0.85,
					ease: "power4.out",
					stagger: 0.055,
				},
			)
		}, root)

		return () => ctx.revert()
	}, [])

	useEffect(() => {
		const { gsap, Flip } = ensureGsap()
		const grid = gridRef.current
		if (!grid) return

		const state = Flip.getState(grid.querySelectorAll("[data-result-card]"))
		requestAnimationFrame(() => {
			Flip.from(state, {
				duration: 0.85,
				ease: "power4.inOut",
				absolute: true,
				stagger: 0.018,
				onEnter: (els) =>
					gsap.fromTo(
						els,
						{ opacity: 0, scale: 0.985, filter: "blur(8px)" },
						{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.38, clearProps: "filter" },
					),
				onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
			})
		})
	}, [filter])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const root = rootRef.current
		if (!root) return

		const cardsEls = root.querySelectorAll<HTMLElement>("[data-result-card]")
		if (!cardsEls.length) return

		if (selected) {
			gsap.to(cardsEls, {
				scale: 0.975,
				opacity: 0.28,
				filter: "blur(2px)",
				duration: 0.35,
				ease: "power2.out",
				overwrite: true,
			})
		} else {
			gsap.to(cardsEls, {
				scale: 1,
				opacity: 1,
				filter: "blur(0px)",
				duration: 0.35,
				ease: "power2.out",
				clearProps: "filter",
				overwrite: true,
			})
		}
	}, [selected])

	const FilterButton = ({ v }: { v: Category }) => (
		<button
			type="button"
			onClick={() => setFilter(v)}
			className={
				"sf-border rounded-full px-4 py-2 text-[12px] tracking-[0.18em] transition " +
				(v === filter
					? "text-white"
					: "text-white/55 hover:text-white/85")
			}
		>
			<span className="relative z-10">{v.toUpperCase()}</span>
		</button>
	)

	return (
		<div ref={rootRef} className="min-h-screen text-white">
			<div className="mx-auto max-w-6xl px-6 pt-28 pb-10">
				<div className="text-white/45 text-[11px] tracking-[0.26em]">RESULTS</div>
				<h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-[1.05] sf-title">
					{q ? (
						<>
							Search results for <span className="text-white">“{q}”</span>
						</>
					) : (
						"Search results"
					)}
				</h1>
				<p className="mt-4 text-white/55">
					Flip shuffle + hover depth + overlay.
				</p>

				<div className="mt-6 flex flex-wrap gap-2">
					<FilterButton v="All" />
					<FilterButton v="Coffee" />
					<FilterButton v="Market" />
					<FilterButton v="Food" />
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-6 pb-24">
				<div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{cards.map((c) => (
						<button
							key={c.name}
							type="button"
							data-result-card
							onClick={() => setSelected(c)}
							className="group relative overflow-hidden rounded-[28px] text-left"
						>
							<div className="absolute inset-0 sf-border" />
							<div className="relative sf-glass rounded-[28px] overflow-hidden p-6">
								<div className="absolute inset-0 opacity-60 pointer-events-none sf-sheen" />
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
									<div className="absolute -inset-16 bg-[radial-gradient(circle_at_30%_30%,rgba(125,211,252,0.18),transparent_55%)]" />
									<div className="absolute -inset-16 bg-[radial-gradient(circle_at_70%_70%,rgba(167,139,250,0.15),transparent_55%)]" />
								</div>

								<div className="relative">
									<div className="text-white/45 text-[11px] tracking-[0.22em]">
										{c.city.toUpperCase()} • {c.category.toUpperCase()}
									</div>
									<div className="mt-2 text-xl font-semibold">
										<span className="relative">
											{c.name}
											<span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
										</span>
									</div>
									<div className="mt-3 text-white/55">
										{c.distanceKm.toFixed(1)} km away
									</div>
								</div>

								{/* corner gradient sweep */}
								<div className="absolute right-0 top-0 h-24 w-24 opacity-60">
									<div className="absolute inset-0 bg-[conic-gradient(from_180deg,rgba(255,255,255,0.0),rgba(255,255,255,0.22),rgba(255,255,255,0.0))] translate-x-8 -translate-y-8 rotate-45" />
								</div>
							</div>
						</button>
					))}
				</div>
			</div>

			<ResultsDetailOverlay
				open={Boolean(selected)}
				onClose={() => setSelected(null)}
				title={selected?.name ?? ""}
				subtitle={
					selected
						? `${selected.city} • ${selected.distanceKm.toFixed(1)} km away • ${selected.category}`
						: ""
				}
			/>
		</div>
	)
}
