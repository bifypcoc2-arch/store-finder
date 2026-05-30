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
		const searchWrap = searchWrapRef.current
		if (!searchWrap) return

		gsap.set(searchWrap, { clipPath: "inset(50% 0% 50% 0%)" })
		const tl = gsap.timeline()
		tl.fromTo(
			"[data-hero-char]",
			{ y: 40, opacity: 0 },
			{ y: 0, opacity: 1, stagger: 0.03, duration: 0.75, ease: "power4.out" },
		).to(searchWrap, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power4.inOut" }, "-=0.3")
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
				if (!r.ok) { setItems([]); setOpen(false); return }
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
				for (const it of next) { if (seen.has(it.name)) continue; seen.add(it.name); uniq.push(it); if (uniq.length >= 8) break }
				setItems(uniq)
				setOpen(true)
			} catch (e) {
				if ((e as any)?.name !== "AbortError") { setItems([]); setOpen(false) }
			} finally { setLoading(false) }
		}
		const t = setTimeout(run, 240)
		return () => { clearTimeout(t); ac.abort() }
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
			sessionStorage.setItem("sf:searchAnim", JSON.stringify({ from: { left: r.left, top: r.top, width: r.width, height: r.height }, value: val }))
		}
		navigateWithTransition((url) => router.push(url), `/results?q=${encodeURIComponent(val)}`)
	}

	return (
		<section ref={rootRef} className="relative min-h-screen overflow-hidden">
			<WebGLDots className="absolute inset-0 opacity-90" />
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute inset-0" style=
					background:
						"radial-gradient(900px 500px at 15% 20%, rgba(0,229,255,0.18), transparent 65%)," +
						"radial-gradient(900px 500px at 85% 25%, rgba(255,61,242,0.14), transparent 65%)," +
						"radial-gradient(900px 600px at 80% 85%, rgba(167,255,61,0.10), transparent 70%)"
				 />
			</div>

			<div className="sf-shell relative z-10 pt-28 md:pt-32">
				<div className="inline-flex items-center gap-3 sf-frame px-4 py-3">
					<span className="size-2 rounded-full" style= background: "var(--n2)", boxShadow: "0 0 24px rgba(167,255,61,0.35)"  />
					<span className="sf-kicker">NEO-BRUTAL CYBER GRID UI</span>
				</div>

				<h1 className="mt-8 text-5xl md:text-7xl font-semibold leading-[0.90] sf-h1">
					{"STORE".split("").map((ch, i) => (
						<span key={`a-${i}`} data-hero-char className="inline-block will-change-transform">{ch}</span>
					))}
					<span className="inline-block">&nbsp;</span>
					{"FINDER".split("").map((ch, i) => (
						<span key={`b-${i}`} data-hero-char className="inline-block will-change-transform">{ch}</span>
					))}
				</h1>

				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="sf-frame p-6">
						<div className="sf-kicker">SYSTEM</div>
						<div className="mt-3 text-white/70">Hard edges, neon rails, dense hierarchy.</div>
						<div className="mt-4 sf-neon-line" />
						<div className="mt-4 text-white/55 text-sm">GSAP + Lenis + Flip + Three.js</div>
					</div>
					<div className="sf-frame p-6">
						<div className="sf-kicker">SEARCH</div>
						<div className="mt-3 text-white/70">Overpass suggestions with blur-stagger.</div>
						<div className="mt-4 sf-neon-line" />
						<div className="mt-4 text-white/55 text-sm">Route to results with curtain transition</div>
					</div>
				</div>

				<div ref={searchWrapRef} className="mt-10 will-change-[clip-path]">
					<SearchBar
						ref={searchShellRef}
						value={query}
						onChange={setQuery}
						onSubmit={() => { const val = query.trim(); if (!val) return; navigateToResults(val) }}
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
									className="sf-hard px-5 py-4 text-left text-white/90 hover:bg-white/10 transition"
									data-suggest
								>
									<div className="sf-kicker">{it.kind.toUpperCase()}</div>
									<div className="mt-2 text-base">{it.name}</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			<ScrollIndicator />
		</section>
	)
}
