"use client"

import { useEffect, useRef } from "react"
import { ensureGsap } from "@/lib/gsap/gsap"

type Particle = {
	x: number
	y: number
	vx: number
	vy: number
	life: number
	maxLife: number
	size: number
}

export function CustomCursor() {
	const dotRef = useRef<HTMLDivElement | null>(null)
	const ringRef = useRef<HTMLDivElement | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => {
		const { gsap } = ensureGsap()
		const dot = dotRef.current
		const ring = ringRef.current
		const canvas = canvasRef.current
		if (!dot || !ring || !canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		let w = 1
		let h = 1
		const resize = () => {
			w = window.innerWidth
			h = window.innerHeight
			canvas.width = Math.floor(w * Math.min(window.devicePixelRatio, 2))
			canvas.height = Math.floor(h * Math.min(window.devicePixelRatio, 2))
			canvas.style.width = w + "px"
			canvas.style.height = h + "px"
			ctx.setTransform(Math.min(window.devicePixelRatio, 2), 0, 0, Math.min(window.devicePixelRatio, 2), 0, 0)
		}
		resize()
		window.addEventListener("resize", resize)

		let x = w / 2
		let y = h / 2
		let rx = x
		let ry = y

		const particles: Particle[] = []
		const maxParticles = 120

		const spawn = (sx: number, sy: number) => {
			for (let i = 0; i < 18; i++) {
				if (particles.length >= maxParticles) particles.shift()
				const a = Math.random() * Math.PI * 2
				const sp = 2 + Math.random() * 4
				particles.push({
					x: sx,
					y: sy,
					vx: Math.cos(a) * sp,
					vy: Math.sin(a) * sp,
					life: 0,
					maxLife: 26 + Math.random() * 20,
					size: 1 + Math.random() * 2,
				})
			}
		}

		const onMove = (e: PointerEvent) => {
			x = e.clientX
			y = e.clientY
			gsap.set(dot, { x, y })
		}

		const onDown = () => {
			ring.classList.add("sf-cursor--active")
			spawn(x, y)
		}
		const onUp = () => ring.classList.remove("sf-cursor--active")

		const onOver = (e: Event) => {
			const t = e.target as HTMLElement | null
			if (!t) return
			const hover = t.closest("a,button,[data-cursor=button]")
			if (hover) ring.classList.add("sf-cursor--hover")
		}
		const onOut = () => ring.classList.remove("sf-cursor--hover")

		window.addEventListener("pointermove", onMove, { passive: true })
		window.addEventListener("pointerdown", onDown)
		window.addEventListener("pointerup", onUp)
		document.addEventListener("mouseover", onOver, true)
		document.addEventListener("mouseout", onOut, true)

		let raf = 0
		const loop = () => {
			// ring lag
			rx += (x - rx) * 0.16
			ry += (y - ry) * 0.16
			gsap.set(ring, { x: rx, y: ry })

			// particles
			ctx.clearRect(0, 0, w, h)
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i]
				p.life += 1
				p.x += p.vx
				p.y += p.vy
				p.vx *= 0.96
				p.vy *= 0.96
				p.vy += 0.06

				const t = 1 - p.life / p.maxLife
				if (t <= 0) {
					particles.splice(i, 1)
					continue
				}

				ctx.globalAlpha = t
				ctx.fillStyle = "rgba(255,255,255,0.9)"
				ctx.beginPath()
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
				ctx.fill()
			}
			ctx.globalAlpha = 1

			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)

		// initial set
		gsap.set(dot, { x, y })
		gsap.set(ring, { x: rx, y: ry })

		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener("resize", resize)
			window.removeEventListener("pointermove", onMove)
			window.removeEventListener("pointerdown", onDown)
			window.removeEventListener("pointerup", onUp)
			document.removeEventListener("mouseover", onOver, true)
			document.removeEventListener("mouseout", onOut, true)
		}
	}, [])

	return (
		<>
			<canvas
				ref={canvasRef}
				className="pointer-events-none fixed inset-0 z-[9999]"
				aria-hidden
			/>
			<div
				ref={dotRef}
				className="sf-cursor-dot pointer-events-none fixed left-0 top-0 z-[10000]"
				aria-hidden
			/>
			<div
				ref={ringRef}
				className="sf-cursor-ring pointer-events-none fixed left-0 top-0 z-[10000]"
				aria-hidden
			/>
		</>
	)
}
