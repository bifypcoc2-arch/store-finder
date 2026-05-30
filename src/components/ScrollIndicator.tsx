"use client"

import { useEffect, useRef } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

type Props = {
	className?: string
}

export function ScrollIndicator({ className }: Props) {
	const arrowRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const { gsap } = ensureGsap()
		const arrow = arrowRef.current
		if (!arrow) return

		const tl = gsap.timeline({ repeat: -1, yoyo: true })
		tl.to(arrow, { y: 10, duration: 0.65, ease: "power2.inOut" })
		return () => tl.kill()
	}, [])

	return (
		<div
			className={
				className ??
				"absolute left-1/2 bottom-10 -translate-x-1/2 flex flex-col items-center gap-4"
			}
		>
			<div className="relative size-16">
				<svg className="absolute inset-0" viewBox="0 0 64 64" aria-hidden>
					<defs>
						<path
							id="circlePath"
							d="M32,32 m-22,0 a22,22 0 1,1 44,0 a22,22 0 1,1 -44,0"
						/>
					</defs>
					<text fill="rgba(255,255,255,0.75)" fontSize="8" letterSpacing="2">
						<textPath href="#circlePath" startOffset="0%">
							SCROLL • SCROLL • SCROLL • SCROLL •
						</textPath>
					</text>
				</svg>
				<div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" />
			</div>

			<div ref={arrowRef} className="flex flex-col items-center text-white/70">
				<div className="h-7 w-px bg-white/30" />
				<div className="mt-1 size-2 rotate-45 border-b border-r border-white/60" />
			</div>
		</div>
	)
}
