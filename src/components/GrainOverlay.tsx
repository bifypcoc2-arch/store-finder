"use client"

export function GrainOverlay() {
	return (
		<div className="pointer-events-none fixed inset-0 z-[9990] opacity-[0.12] mix-blend-overlay">
			<svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
				<filter id="noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.9"
						numOctaves="3"
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#noise)" />
			</svg>
		</div>
	)
}
