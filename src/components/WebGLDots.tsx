"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

type Props = {
	className?: string
}

export function WebGLDots({ className }: Props) {
	const mountRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		let disposed = false

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		renderer.setClearColor(0x000000, 0)
		mount.appendChild(renderer.domElement)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
		camera.position.set(0, 0.8, 4.2)

		const gridX = 120
		const gridY = 70
		const count = gridX * gridY

		const baseGeom = new THREE.IcosahedronGeometry(0.011, 0)
		const geom = new THREE.InstancedBufferGeometry().copy(baseGeom)
		baseGeom.dispose()

		const offsets = new Float32Array(count * 3)
		let p = 0
		for (let y = 0; y < gridY; y++) {
			for (let x = 0; x < gridX; x++) {
				const fx = x / (gridX - 1) - 0.5
				const fy = y / (gridY - 1) - 0.5
				offsets[p++] = fx * 3.2
				offsets[p++] = fy * 1.9
				offsets[p++] = 0
			}
		}
		geom.setAttribute("iOffset", new THREE.InstancedBufferAttribute(offsets, 3))

		const uniforms = {
			uTime: { value: 0 },
			uMouse: { value: new THREE.Vector2(10, 10) },
			uStrength: { value: 0.35 },
		}

		const material = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms,
			vertexShader: /* glsl */ `
				attribute vec3 iOffset;
				uniform float uTime;
				uniform vec2 uMouse;
				uniform float uStrength;
				varying float vAlpha;
				varying float vHue;

				float wave(vec2 p, vec2 c) {
					float d = distance(p, c);
					return sin(d * 10.0 - uTime * 2.2) * exp(-d * 1.6);
				}

				void main() {
					vec3 pos = position;
					vec3 off = iOffset;

					float w = wave(off.xy, uMouse) * uStrength;
					float base = sin((off.x * 1.2 + off.y * 1.8) + uTime * 0.7) * 0.06;
					pos.z += base + w;

					// subtle size breathing
					pos *= (1.0 + (base + w) * 0.25);

					vec4 mv = modelViewMatrix * vec4(pos + off, 1.0);
					gl_Position = projectionMatrix * mv;

					float a = 0.65 + (base + w) * 2.2;
					vAlpha = clamp(a, 0.15, 1.0);
					vHue = 0.55 + off.x * 0.08 + off.y * 0.05 + w * 0.8;
				}
			`,
			fragmentShader: /* glsl */ `
				precision highp float;
				varying float vAlpha;
				varying float vHue;

				vec3 hsl2rgb(vec3 c) {
					vec3 rgb = clamp( abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0 );
					rgb = rgb*rgb*(3.0-2.0*rgb);
					float l = c.z;
					return c.z + c.y*(rgb-0.5)*(1.0-abs(2.0*l-1.0));
				}

				void main() {
					vec3 col = hsl2rgb(vec3(fract(vHue), 0.65, 0.55));
					gl_FragColor = vec4(col, vAlpha);
				}
			`,
		})

		const mesh = new THREE.Mesh(geom, material)
		mesh.frustumCulled = false
		scene.add(mesh)

		function resize() {
			if (!mount) return
			const w = mount.clientWidth
			const h = mount.clientHeight
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}

		const ro = new ResizeObserver(resize)
		ro.observe(mount)
		resize()

		const onPointerMove = (e: PointerEvent) => {
			const rect = mount.getBoundingClientRect()
			const nx = (e.clientX - rect.left) / rect.width
			const ny = (e.clientY - rect.top) / rect.height
			// map to our plane-ish coords (same as offsets scale)
			uniforms.uMouse.value.set((nx - 0.5) * 3.2, (0.5 - ny) * 1.9)
		}

		mount.addEventListener("pointermove", onPointerMove)

		let start = performance.now()
		let raf = 0
		const loop = (t: number) => {
			if (disposed) return
			uniforms.uTime.value = (t - start) / 1000
			renderer.render(scene, camera)
			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)

		return () => {
			disposed = true
			cancelAnimationFrame(raf)
			mount.removeEventListener("pointermove", onPointerMove)
			ro.disconnect()
			material.dispose()
			geom.dispose()
			renderer.dispose()
			if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
		}
	}, [])

	return <div ref={mountRef} className={className} />
}
