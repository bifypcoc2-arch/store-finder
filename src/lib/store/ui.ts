import { create } from "zustand"

type UiState = {
	isTransitioning: boolean
	setTransitioning: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
	isTransitioning: false,
	setTransitioning: (v) => set({ isTransitioning: v }),
}))
