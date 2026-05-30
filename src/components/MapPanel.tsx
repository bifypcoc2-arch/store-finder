"use client"

import { useEffect, useMemo, useRef } from "react"
import L from "leaflet"
import { ensureGsap } from "@/lib/gsap/gsap"

export type MapPoint = {
	id: string
	name: string
	lat: number
	lng: number
}

type Props = {
	points: MapPoint[]
	activeId?: string
	onSelect?: (id: string) => void
}

function makeSvgMarker() {
	const svg = `
		<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<radialGradient id="g" cx="30%" cy="30%" r="70%">
					<stop offset="0%" stop-color="rgba(255,255,255,0.9)"/>
					<stop offset="45%" stop-color="rgba(120,180,255,0.85)"/>
					<stop offset="100%" stop-color="rgba(0,0,0,0)"/>
				</radialGradient>
			</defs>
			<circle cx="18" cy="18" r="7" fill="url(#g)"/>
			<circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.25)"/>
		</svg>
	`.trim()

	return L.divIcon({
		className: "sf-marker",
		html: svg,
		iconSize: [36, 36],
		iconAnchor: [18, 18],
	})
}

export function MapPanel({ points, activeId, onSelect }: Props) {
	const wrapRef = useRef<HTMLDivElement | null>(null)
	const mapRef = useRef<L.Map | null>(null)
	const layerRef = useRef<L.LayerGroup | null>(null)
	const routeRef = useRef<L.Polyline | null>(null)

	const icon = useMemo(() => makeSvgMarker(), [])

	useEffect(() => {
		const el = wrapRef.current
		if (!el) return

		const map = L.map(el, {
			zoomControl: false,
			attributionControl: false,
			scrollWheelZoom: false,
		})
		mapRef.current = map

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
		}).addTo(map)

		const layer = L.layerGroup().addTo(map)
		layerRef.current = layer

		map.setView([52.52, 13.405], 12)

		return () => {
			map.remove()
			mapRef.current = null
			layerRef.current = null
			routeRef.current = null
		}
	}, [])

	useEffect(() => {
		const { gsap } = ensureGsap()
		const map = mapRef.current
		const layer = layerRef.current
		if (!map || !layer) return

		layer.clearLayers()

		// route polyline (dashed)
		if (routeRef.current) {
			routeRef.current.remove()
			routeRef.current = null
		}

		if (points.length >= 2) {
			const latlngs = points.map((p) => [p.lat, p.lng] as [number, number])
			const route = L.polyline(latlngs, {
				color: "rgba(255,255,255,0.65)",
				weight: 2,
				opacity: 0.9,
				dashArray: "6 10",
			}).addTo(map)
			routeRef.current = route

			// Animate dashoffset on the SVG path
			requestAnimationFrame(() => {
				const path = (route as any)._path as SVGPathElement | undefined
				if (!path) return
				gsap.fromTo(
					path,
					{ strokeDashoffset: 120 },
					{
						strokeDashoffset: 0,
						duration: 1.2,
						ease: "none",
						repeat: -1,
					},
				)
			})
		}

		points.forEach((p) => {
			const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer)
			marker.on("click", () => onSelect?.(p.id))
			marker.bindTooltip(p.name, {
				direction: "top",
				opacity: 0.95,
				className: "sf-tooltip",
			})

			marker.on("add", () => {
				const node = marker.getElement()
				if (!node) return
				gsap.fromTo(
					node,
					{ y: 20, scale: 0.6, opacity: 0 },
					{ y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "power4.out" },
				)
			})

			marker.on("tooltipopen", () => {
				const tip = document.querySelector<HTMLElement>(".sf-tooltip")
				if (!tip) return
				gsap.fromTo(
					tip,
					{ y: 8, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.25, ease: "power2.out" },
				)
			})
		})
	}, [points, icon, onSelect])

	useEffect(() => {
		const map = mapRef.current
		if (!map) return
		if (!activeId) return

		const p = points.find((x) => x.id === activeId)
		if (!p) return

		map.flyTo([p.lat, p.lng], 14, { duration: 0.9 })
	}, [activeId, points])

	return (
		<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
			<div className="text-white/60 text-sm">Map</div>
			<div className="mt-3 h-56 rounded-xl overflow-hidden">
				<div ref={wrapRef} className="h-full w-full" />
			</div>
		</div>
	)
}
