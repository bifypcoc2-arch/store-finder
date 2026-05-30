"use client"

import { useEffect, useMemo, useRef } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

type Panel = {
	number: number
	suffix: string
	title: string
	subtitle: string
}

export function AboutPanels() {
	const rootRef = useRef<HTMLElement | null>(null)
	const trackRef = useRef<HTMLDivElement | null>(null)

	const panels = useMemo<Panel[]>(
		() => [
			{
				number: 10_000,
				suffix: "+",
				title: "stores",
				subtitle: "Indexed places from OpenStreetMap",
			},
			{
				number: 50,
				suffix: "+",
				title: "cities",
				subtitle: "Designed for multi-region search",
			},
			{
				number: 1,
				suffix: "s",
				title: "real-time",
				subtitle: "Fast suggestions and smooth UI",
			},
			{
				number: 0,
				suffix: "$",
				title: "free",
				subtitle: "Prototype-friendly and open data",
			},
		],
		[],
	)

	useEffect(() => {
		const { gsap, ScrollTrigger } = ensureGsap()
		const root = rootRef.current
		const track = trackRef.current
		if (!root || !track) return

		const ctx = gsap.context(() => {
			const panelsEls = gsap.utils.toArray<HTMLElement>("[data-panel]")

			// mask reveal setup
			gsap.set("[data-reveal]", { clipPath: "inset(100% 0% 0% 0%)" })

			// Horizontal scroll via pin
			const totalPanels = panelsEls.length
			const totalShift = (totalPanels - 1) * 100

			gsap.to(track, {
				xPercent: -totalShift,
				ease: "none",
				scrollTrigger: {
					trigger: root,
					start: "top top",
					end: () => `+=${window.innerWidth * (totalPanels - 1)}`,
					scrub: 1,
					pin: true,
					anticipatePin: 1,
				},
			})

			// per-panel triggers: countup + reveal
			panelsEls.forEach((panelEl) => {
				const numEl = panelEl.querySelector<HTMLElement>("[data-count]")
				const target = Number(numEl?.dataset.target ?? "0")

				ScrollTrigger.create({
					trigger: panelEl,
					start: "left center",
					onEnter: () => {
						// count up
						if (numEl) {
							const obj = { v: 0 }
							gsap.to(obj, {
								v: target,
								duration: 1.1,
								ease: "power2.out",
								onUpdate: () => {
									numEl.textContent = Math.floor(obj.v).toLocaleString()
								},
							})
						}

						// reveal text
						gsap.to(panelEl.querySelectorAll<HTMLElement>("[data-reveal]"), {
							clipPath: "inset(0% 0% 0% 0%)",
							duration: 0.7,
							ease: "power4.out",
							stagger: 0.06,
							overwrite: true,
						})
					},
				})
			})
		}, root)

		return () => {
			ctx.revert()
			ScrollTrigger.getAll().forEach((t) => t.kill())
		}
	}, [panels])

	return (
		<section ref={rootRef} className="relative bg-neutral-950 text-white">
			<div className="px-6 pt-24 pb-10 mx-auto max-w-6xl">
				<div className="text-white/60 text-sm tracking-[0.22em]">ABOUT</div>
				<h2 className="mt-3 text-3xl md:text-5xl font-semibold leading-[1.05]">
					A horizontal story that scrolls.
				</h2>
				<p className="mt-4 max-w-2xl text-white/60">
					Pinned section. Vertical scroll drives horizontal panels.
				</p>
			</div>

			<div className="relative overflow-hidden">
				<div
					ref={trackRef}
					className="flex w-[400vw] will-change-transform"
				>
					{panels.map((p, idx) => (
						<div
							key={idx}
							data-panel
							className="w-screen px-6 pb-24"
						>
							<div className="mx-auto max-w-6xl">
								<div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-10 md:p-14">
									<div className="text-6xl md:text-8xl font-semibold tracking-tight">
										<span
											data-count
											data-target={p.number}
										>
											0
										</span>
										<span className="text-white/60">{p.suffix}</span>
									</div>

									<div className="mt-6">
										<div
											data-reveal
											className="text-2xl md:text-3xl font-medium"
										>
											{p.title}
										</div>
										<div
											data-reveal
											className="mt-3 text-white/60 max-w-xl"
										>
											{p.subtitle}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
