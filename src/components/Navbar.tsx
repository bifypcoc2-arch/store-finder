"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ensureGsap } from "@/lib/gsap/gsap"

const LANGS = ["EN", "RU", "DE", "FR"] as const

export function Navbar() {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const prevYRef = useRef(0)
	const [lang, setLang] = useState<(typeof LANGS)[number]>("EN")

	useEffect(() => {
		const { gsap } = ensureGsap()
		const el = rootRef.current
		if (!el) return

		// hidden initially
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

			// show when scrolling up, hide when scrolling down
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

	return (
		<div
			ref={rootRef}
			className="fixed left-0 right-0 top-0 z-[9997] px-4 pt-4"
		>
			<div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
				<div className="flex items-center justify-between px-5 py-4">
					<Link href="/" className="group inline-flex items-center gap-3">
						<div className="size-2 rounded-full bg-white/70" />
						<div className="text-sm tracking-[0.22em] text-white/80">
							STORE FINDER
						</div>
					</Link>

					<div className="flex items-center gap-3">
						<div className="hidden sm:block text-xs text-white/50">LANG</div>
						<div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
							{LANGS.map((l) => (
								<button
									key={l}
									type="button"
									onClick={() => setLang(l)}
									className={
										"relative rounded-full px-3 py-1 text-xs transition " +
										(l === lang
											? "text-white"
											: "text-white/50 hover:text-white/80")
									}
								>
									{l === lang ? (
										<span data-lang-current>{l}</span>
									) : (
										l
									)}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
