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
				const r = await fetch(`/api/overpass?q=${encodeURIComponent(q)}`, {
					signal: ac.signal,
				})

				if (!r.ok) {
					setItems([])
					setOpen(false)
					return
				}

				const data = (await r.json()) as {
					elements: Array<{ tags?: Record<string, string>; type: string }>
				}

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

		const t = setTimeout(run, 250)
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
			{ y: 18, opacity: 0, filter: "blur(10px)" },
			{
				y: 0,
				opacity: 1,
				filter: "blur(0px)",
				duration: 0.55,
				ease: "power3.out",
				stagger: 0.06,
				clearProps: "filter",
			},
		)
	}, [open, items.length])

	const navigateToResults = (val: string) => {
		const shell = searchShellRef.current
		if (shell) {
			const r = shell.getBoundingClientRect()
			sessionStorage.setItem(
				"sf:searchAnim",
				JSON.stringify({
					from: { left: r.left, top: r.top, width: r.width, height: r.height },
					value: val,
				}),
			)
		}

		navigateWithTransition(
			(url) => router.push(url),
			`/results?q=${encodeURIComponent(val)}`,
		)
	}

	return (
		<section ref={rootRef} className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
			<WebGLDots className="absolute inset-0 opacity-90" />
			<div className="absolute inset-0 pointer-events-none">
				{/* vignette */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(120,180,255,0.08),transparent_55%)]" />
			</div>

			<div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 md:pt-28">
				<h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
					{"Store Finder".split("").map((ch, i) => (
						<span key={i} data-hero-char className="inline-block will-change-transform">
							{ch === " " ? "\u00A0" : ch}
						</span>
					))}
				</h1>

				<p className="mt-5 max-w-xl text-white/70">
					Type a city or category — we’ll fetch places from Overpass and render results.
				</p>

				<div ref={searchWrapRef} className="mt-10 will-change-[clip-path]">
					<SearchBar
						ref={searchShellRef}
						value={query}
						onChange={setQuery}
						onSubmit={() => {
							const val = query.trim()
							if (!val) return
							navigateToResults(val)
						}}
						onFocus={() => {
							if (items.length) setOpen(true)
						}}
						onBlur={() => {
							setTimeout(() => setOpen(false), 120)
						}}
					/>

					{open && (
						<div ref={suggestsRef} className="mt-3 space-y-2">
							{loading && <div className="text-sm text-white/40">Loading…</div>}
							{items.map((it) => (
								<button
									key={`${it.kind}-${it.name}`}
									type="button"
									onClick={() => {
										setQuery(it.name)
										setOpen(false)
										navigateToResults(it.name)
									}}
									className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 backdrop-blur hover:bg-white/10 transition"
									data-suggest
								>
									<div className="text-sm text-white/50">{it.kind}</div>
									<div className="text-base">{it.name}</div>
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
