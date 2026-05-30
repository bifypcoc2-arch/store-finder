"use client"

import { useEffect, useRef } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

type Props = {
	open: boolean
	onClose: () => void
	title: string
	subtitle: string
}

export function ResultsDetailOverlay({ open, onClose, title, subtitle }: Props) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const panelRef = useRef<HTMLDivElement | null>(null)

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
				className="w-[min(980px,92vw)] rounded-3xl border border-white/10 bg-neutral-950/80 backdrop-blur-xl p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
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
					<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
						<div className="text-white/60 text-sm">Map panel (next)</div>
						<div className="mt-2 h-48 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.10),transparent_55%)]" />
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
						<div className="text-white/60 text-sm">Info</div>
						<ul className="mt-3 space-y-2 text-white/75 text-sm">
							<li>• Flip expand + background blur</li>
							<li>• Route + markers coming next</li>
							<li>• Filters + Flip shuffle coming next</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
