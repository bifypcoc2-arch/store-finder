"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

type Props = {
	onDone?: () => void
}

export function Preloader({ onDone }: Props) {
	const rootRef = useRef<HTMLDivElement | null>(null)
	const topRef = useRef<HTMLDivElement | null>(null)
	const bottomRef = useRef<HTMLDivElement | null>(null)
	const scanRef = useRef<HTMLDivElement | null>(null)

	const [percent, setPercent] = useState(0)
	const scanLines = useMemo(() => Array.from({ length: 14 }), [])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const root = rootRef.current
		const top = topRef.current
		const bottom = bottomRef.current
		const scan = scanRef.current
		if (!root || !top || !bottom || !scan) return

		// initial
		gsap.set([top, bottom], { yPercent: 0 })
		gsap.set(root, { opacity: 1, pointerEvents: "auto" })
		gsap.set(scan, { yPercent: -30, opacity: 1 })

		// scanlines loop
		const scanTween = gsap.to(scan, {
			yPercent: 30,
			duration: 0.9,
			ease: "none",
			repeat: -1,
		})

		// main timeline
		const counterObj = { v: 0 }

		const tl = gsap.timeline({
			defaults: { ease: "power2.out" },
			onComplete: () => {
				onDone?.()
			},
		})

		// 0 -> 100
		tl.to(counterObj, {
			v: 100,
			duration: 2.2,
			ease: "none",
			onUpdate: () => setPercent(Math.floor(counterObj.v)),
		})

		// stop scan loop right before tearing
		tl.add(() => scanTween.kill())

		// tear open
		tl.to([top, bottom], {
			duration: 0.35,
			yPercent: (i) => (i === 0 ? -110 : 110),
			ease: "power4.inOut",
		})

		// fade out overlay
		tl.to(
			root,
			{
				opacity: 0,
				duration: 0.15,
				pointerEvents: "none",
			},
			"-=0.05",
		)

		return () => {
			scanTween.kill()
			tl.kill()
		}
	}, [onDone])

	return (
		<div
			ref={rootRef}
			className="fixed inset-0 z-9999 bg-black text-white overflow-hidden"
			aria-label="Preloader"
		>
			{/* top half */}
			<div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-black" />
			{/* bottom half */}
			<div
				ref={bottomRef}
				className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
			/>

			{/* counter */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center select-none">
					<div className="text-[72px] md:text-[110px] font-mono tracking-tight leading-none">
						{percent}%
					</div>
				</div>
			</div>

			{/* scanlines wrapper */}
			<div
				ref={scanRef}
				className="absolute inset-0 opacity-80 mix-blend-screen pointer-events-none"
			>
				{scanLines.map((_, i) => (
					<div
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						className="w-full h-0.5 bg-white/10"
					/>
				))}
			</div>
		</div>
	)
}