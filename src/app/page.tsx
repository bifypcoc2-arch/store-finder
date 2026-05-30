"use client"

import { useState } from "react"
import { Preloader } from "@/components/Preloader"
import { Hero } from "@/components/Hero"

export default function Home() {
	const [ready, setReady] = useState(false)

	return (
		<main className="min-h-screen bg-neutral-950 text-white">
			{!ready && <Preloader onDone={() => setReady(true)} />}
			<Hero />
		</main>
	)
}