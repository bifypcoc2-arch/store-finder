"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"
import { navigateWithTransition } from "@/lib/transitions/navigateWithTransition"
import { WebGLDots } from "@/components/WebGLDots"
import { ScrollIndicator } from "@/components/ScrollIndicator"
import { SearchBar } from "@/components/SearchBar"

type SuggestItem = { name: string; kind: string }

export function Hero() {
	const router = useRouter()
	const rootRef = useRef<HTMLElement | null>(null)
	const searchShellRef = useRef<HTMLDivElement | null>(null)
	const searchWrapRef = useRef<HTMLDivElement | null>(null)
	const suggestsRef = useRef<HTMLDivElement | null>(null)

	const [query, setQuery] = useState("")
	const [items, setItems] = useState<SuggestItem[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)

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
			{ y: 0, opacity: 1, stagger: 0.03, duration: 0.75, ease: "power4.out" },
		).to(
			searchWrap,
			{ clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power4.inOut" },
			"-=0.3",
		)

		return () => tl.kill()
	}, [])

	useEffect(() => {
		const ac = new AbortController()
		const run = async () => {
			const q = query.trim()
			if (q.length < 2) {
				setItems([])
				setOpen(false)
				return
			}
			setLoading(true)
			try {
				const r = await fetch(`/api/overpass?q=${encodeURIComponent(q)}`, { signal: ac.signal })
				if (!r.ok) {
					setItems([])
					setOpen(false)
					return
				}
				const data = (await r.json()) as { elements: Array<{ tags?: Record<string, string>; type: string }> }
				const next = (data.elements ?? [])
					.map((el) => {
						const name = el.tags?.name
						if (!name) return null
						return { name, kind: el.type }
					})
					.filter(Boolean) as SuggestItem[]

				const uniq: SuggestItem[] = []
				const seen = new Set<string>()
				for (const it of next) {
					if (seen.has(it.name)) continue
					seen.add(it.name)
					uniq.push(it)
					if (uniq.length >= 8) break
				}

				setItems(uniq)
				setOpen(true)
			} catch (e) {
				if ((e as any)?.name !== "AbortError") {
					setItems([])
					setOpen(false)
				}
			} finally {
				setLoading(false)
			}
		}
		const t = setTimeout(run, 240)
		return () => {
			clearTimeout(t)
			ac.abort()
		}
	}, [query])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const wrap = suggestsRef.current
		if (!wrap) return
		const els = wrap.querySelectorAll<HTMLElement>("[data-suggest]")
		if (!els.length) return
		gsap.fromTo(
			els,
			{ y: 18, opacity: 0, filter: "blur(12px)" },
			{ y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.06, clearProps: "filter" },
		)
	}, [open, items.length])

	const navigateToResults = (val: string) => {
		const shell = searchShellRef.current
		if (shell) {
			const r = shell.getBoundingClientRect()
			sessionStorage.setItem(
				"sf:searchAnim",
				JSON.stringify({ from: { left: r.left, top: r.top, width: r.width, height: r.height }, value: val }),
			)
		}
		navigateWithTransition((url) => router.push(url), `/results?q=${encodeURIComponent(val)}`)
	}

	return (
		<section ref={rootRef} className="relative min-h-screen overflow-hidden">
			<WebGLDots className="absolute inset-0 opacity-90" />
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.08),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(96,165,250,0.12),transparent_58%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(167,139,250,0.12),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(251,113,133,0.08),transparent_60%)]" />
			</div>

			<div className="sf-shell relative z-10 pt-28 md:pt-32">
				<div className="inline-flex items-center gap-3 sf-chip">
					<span className="size-2 rounded-full bg-white/80 shadow-[0_0_26px_rgba(96,165,250,0.22)]" />
					<span className="text-[11px] tracking-[0.28em] text-white/60">AWARDS-LEVEL UI SYSTEM</span>
				</div>

				<h1 className="mt-7 text-5xl md:text-7xl font-semibold leading-[0.92] sf-h1">
					{"Store Finder".split("").map((ch, i) => (
						<span key={i} data-hero-char className="inline-block will-change-transform">
							{ch === " " ? "\u00A0" : ch}
						</span>
					))}
				</h1>

				<p className="mt-6 max-w-2xl text-white/60">
					Neo-editorial layout, deep glass surfaces, controlled motion, and interactive 3D background.
				</p>

				<div ref={searchWrapRef} className="mt-10 will-change-[clip-path]">
					<SearchBar
						ref={searchShellRef}
						value={query}
						onChange={setQuery}
						onSubmit={() => {
							const val = query.trim(); if (!val) return; navigateToResults(val)
						}}
						onFocus={() => { if (items.length) setOpen(true) }}
						onBlur={() => { setTimeout(() => setOpen(false), 120) }}
					/>

					{open && (
						<div ref={suggestsRef} className="mt-3 space-y-2">
							{loading && <div className="text-sm text-white/40">Loading…</div>}
							{items.map((it) => (
								<button
									key={`${it.kind}-${it.name}`}
									type="button"
									onClick={() => { setQuery(it.name); setOpen(false); navigateToResults(it.name) }}
									className="sf-panel relative overflow-hidden rounded-[var(--r2)] px-5 py-4 text-left text-white/90 hover:bg-white/10 transition"
									data-suggest
								>
									<div className="absolute inset-0 opacity-55 pointer-events-none sf-sheen" />
									<div className="relative">
										<div className="text-[11px] tracking-[0.22em] text-white/45">{it.kind.toUpperCase()}</div>
										<div className="mt-2 text-base">{it.name}</div>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				<div className="mt-10 sf-divider" />
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="sf-panel rounded-[var(--r2)] p-6 relative overflow-hidden">
						<div className="absolute inset-0 opacity-55 pointer-events-none sf-sheen" />
						<div className="relative">
							<div className="text-[11px] tracking-[0.22em] text-white/45">MICRO-INTERACTIONS</div>
							<div className="mt-3 text-white/70">Cursor, grain, Flip, glow borders.</div>
						</div>
					</div>
					<div className="sf-panel rounded-[var(--r2)] p-6 relative overflow-hidden">
						<div className="absolute inset-0 opacity-55 pointer-events-none sf-sheen" />
						<div className="relative">
							<div className="text-[11px] tracking-[0.22em] text-white/45">DATA</div>
							<div className="mt-3 text-white/70">Overpass suggestions + Leaflet view.</div>
						</div>
					</div>
					<div className="sf-panel rounded-[var(--r2)] p-6 relative overflow-hidden">
						<div className="absolute inset-0 opacity-55 pointer-events-none sf-sheen" />
						<div className="relative">
							<div className="text-[11px] tracking-[0.22em] text-white/45">MOTION SYSTEM</div>
							<div className="mt-3 text-white/70">GSAP + Lenis + controlled transitions.</div>
						</div>
					</div>
				</div>
			</div>

			<ScrollIndicator />
		</section>
	)
}
