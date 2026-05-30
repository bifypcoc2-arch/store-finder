"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"
import { MapPanel, type MapPoint } from "@/components/MapPanel"

type Props = {
	open: boolean
	onClose: () => void
	title: string
	subtitle: string
}

export function ResultsDetailOverlay({ open, onClose, title, subtitle }: Props) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const panelRef = useRef<HTMLDivElement | null>(null)
	const [activeId, setActiveId] = useState<string | undefined>(undefined)

	const points = useMemo<MapPoint[]>(
		() => [
			{ id: "a", name: "Point A", lat: 52.5208, lng: 13.4095 },
			{ id: "b", name: "Point B", lat: 52.5176, lng: 13.3976 },
			{ id: "c", name: "Point C", lat: 52.5135, lng: 13.4211 },
		],
		[],
	)

	useEffect(() => {
		if (!open) setActiveId(undefined)
	}, [open])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const root = rootRef.current
		const panel = panelRef.current
		if (!root || !panel) return

		if (!open) {
			gsap.set(root, { pointerEvents: "none", opacity: 0 })
			gsap.set(panel, { y: 30, opacity: 0, scale: 0.98 })
			return
		}

		const tl = gsap.timeline()
		tl.set(root, { pointerEvents: "auto" })
			.to(root, { opacity: 1, duration: 0.2, ease: "power2.out" })
			.to(
				panel,
				{ y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power4.out" },
				"-=0.05",
			)

		return () => tl.kill()
	}, [open])

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		if (open) window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open, onClose])

	return (
		<div
			ref={rootRef}
			className="fixed inset-0 z-[9996] flex items-center justify-center bg-black/40 backdrop-blur-md opacity-0 pointer-events-none"
			aria-hidden={!open}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose()
			}}
		>
			<div
				ref={panelRef}
				className="w-[min(1100px,92vw)] rounded-3xl border border-white/10 bg-neutral-950/80 backdrop-blur-xl p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
			>
				<div className="flex items-start justify-between gap-6">
					<div>
						<div className="text-white/50 text-xs tracking-[0.18em]">DETAIL</div>
						<div className="mt-2 text-3xl md:text-4xl font-semibold leading-[1.05]">
							{title}
						</div>
						<div className="mt-3 text-white/60">{subtitle}</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
					>
						Close
					</button>
				</div>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
					<MapPanel
						points={points}
						activeId={activeId}
						onSelect={setActiveId}
					/>
					<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
						<div className="text-white/60 text-sm">Info</div>
						<ul className="mt-3 space-y-2 text-white/75 text-sm">
							<li>• Leaflet map + animated markers</li>
							<li>• Click marker: flyTo</li>
							<li>• Route + filters next</li>
						</ul>
						<div className="mt-4 flex gap-2">
							<button
								type="button"
								onClick={() => setActiveId("a")}
								className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
							>
								Fly A
							</button>
							<button
								type="button"
								onClick={() => setActiveId("b")}
								className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
							>
								Fly B
							</button>
							<button
								type="button"
								onClick={() => setActiveId("c")}
								className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
							>
								Fly C
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
