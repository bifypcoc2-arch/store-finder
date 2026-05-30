"use client"

import { useUiStore } from "@/lib/store/ui"

type NavigateFn = (url: string) => void

/**
 * Triggers the global curtain transition, then navigates.
 * The curtain component listens for this custom event.
 */
export function navigateWithTransition(navigate: NavigateFn, url: string) {
	// mark transitioning (optional hooks)
	useUiStore.getState().setTransitioning(true)

	const ev = new CustomEvent("sf:navigate", { detail: { url } })
	window.dispatchEvent(ev)

	// Fallback: in case curtain isn't mounted, still navigate.
	setTimeout(() => {
		navigate(url)
	}, 20)
}
