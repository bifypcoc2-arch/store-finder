"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ensureGsap } from "@/lib/gsap/gsap"
import { SearchBar } from "@/components/SearchBar"

const LANGS = ["EN", "RU", "DE", "FR"] as const

type StoredSearchAnim = {
	from: { left: number; top: number; width: number; height: number }
	value?: string
}

export function Navbar() {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const searchRef = useRef<HTMLDivElement | null>(null)
	const prevYRef = useRef(0)
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()

	const [lang, setLang] = useState<(typeof LANGS)[number]>("EN")
	const [q, setQ] = useState("")

	useEffect(() => {
		setQ(searchParams.get("q") ?? "")
	}, [searchParams])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = rootRef.current
		if (!el) return

		gsap.set(el, {
			opacity: 0,
			clipPath: "inset(0 0 100% 0)",
			y: -8,
		})

		let shown = false
		let hiding = false

		const show = () => {
			if (shown) return
			shown = true
			hiding = false
			gsap.to(el, {
				opacity: 1,
				y: 0,
				clipPath: "inset(0 0 0% 0)",
				duration: 0.45,
				ease: "power4.out",
				overwrite: true,
			})
		}

		const hide = () => {
			if (!shown || hiding) return
			hiding = true
			gsap.to(el, {
				opacity: 0,
				y: -10,
				clipPath: "inset(0 0 100% 0)",
				duration: 0.35,
				ease: "power4.in",
				overwrite: true,
				onComplete: () => {
					shown = false
					hiding = false
				},
			})
		}

		const onScroll = () => {
			const y = window.scrollY || 0
			const dy = y - prevYRef.current
			prevYRef.current = y

			if (y < 100) {
				hide()
				return
			}

			if (dy < -6) show()
			else if (dy > 8) hide()
		}

		prevYRef.current = window.scrollY || 0
		window.addEventListener("scroll", onScroll, { passive: true })
		onScroll()

		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = rootRef.current
		if (!el) return

		const from = el.querySelector("[data-lang-current]")
		if (!from) return

		gsap.fromTo(
			from,
			{ y: 10, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
		)
	}, [lang])

	// Animate hero search -> navbar search (rect-based)
	useEffect(() => {
		if (pathname !== "/results") return
		const { gsap } = ensureGsap()
		const el = searchRef.current
		if (!el) return

		const raw = sessionStorage.getItem("sf:searchAnim")
		if (!raw) return

		let parsed: StoredSearchAnim | null = null
		try {
			parsed = JSON.parse(raw) as StoredSearchAnim
		} catch {
			parsed = null
		}
		if (!parsed) return

		sessionStorage.removeItem("sf:searchAnim")

		const toRect = el.getBoundingClientRect()
		const fromRect = parsed.from
		if (!toRect.width || !fromRect.width) return

		const dx = fromRect.left - toRect.left
		const dy = fromRect.top - toRect.top
		const sx = fromRect.width / toRect.width
		const sy = fromRect.height / toRect.height

		gsap.fromTo(
			el,
			{
				x: dx,
				y: dy,
				scaleX: sx,
				scaleY: sy,
				transformOrigin: "top left",
			},
			{
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1,
				duration: 0.8,
				ease: "power4.inOut",
				clearProps: "transform",
			},
		)
	}, [pathname])

	return (
		<div ref={rootRef} className="fixed left-0 right-0 top-0 z-[9997] px-4 pt-4">
			<div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
				<div className="flex items-center justify-between gap-4 px-5 py-4">
					<Link href="/" className="group inline-flex items-center gap-3 shrink-0">
						<div className="size-2 rounded-full bg-white/70" />
						<div className="text-sm tracking-[0.22em] text-white/80">STORE FINDER</div>
					</Link>

					{/* navbar search (visible on /results) */}
					{pathname === "/results" && (
						<div className="hidden md:block flex-1 max-w-[520px]" ref={searchRef}>
							<SearchBar
								compact
								value={q}
								onChange={setQ}
								onSubmit={() => {
									const val = q.trim()
									if (!val) return
									router.push(`/results?q=${encodeURIComponent(val)}`)
								}}
							/>
						</div>
					)}

					<div className="flex items-center gap-3 shrink-0">
						<div className="hidden sm:block text-xs text-white/50">LANG</div>
						<div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
							{LANGS.map((l) => (
								<button
									key={l}
									type="button"
									onClick={() => setLang(l)}
									className={
										"relative rounded-full px-3 py-1 text-xs transition " +
										(l === lang ? "text-white" : "text-white/50 hover:text-white/80")
									}
								>
									{l === lang ? <span data-lang-current>{l}</span> : l}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
