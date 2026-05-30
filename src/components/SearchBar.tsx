"use client"

import { forwardRef } from "react"

type Props = {
	value: string
	onChange: (v: string) => void
	onSubmit: () => void
	onFocus?: () => void
	onBlur?: () => void
	placeholder?: string
	compact?: boolean
}

export const SearchBar = forwardRef<HTMLDivElement, Props>(function SearchBar(
	{ value, onChange, onSubmit, onFocus, onBlur, placeholder = "Berlin, coffee, supermarket…", compact },
	ref,
) {
	return (
		<div ref={ref} data-search-shell className="sf-border">
			<div className="relative sf-glass rounded-[var(--radius-xl)] overflow-hidden">
				<div className="absolute inset-0 opacity-60 pointer-events-none sf-sheen" />
				<div className={"px-5 " + (compact ? "py-3" : "py-4")}>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							onSubmit()
						}}
					>
						<label className={"block text-[11px] tracking-[0.22em] " + (compact ? "text-white/45" : "text-white/55")}>
							SEARCH
						</label>
						<div className="mt-2 flex items-center gap-3">
							<div className="size-2 rounded-full bg-white/60 shadow-[0_0_20px_rgba(167,139,250,0.18)]" />
							<input
								suppressHydrationWarning
								value={value}
								onChange={(e) => onChange(e.target.value)}
								onFocus={onFocus}
								onBlur={onBlur}
								className={
									"w-full bg-transparent outline-none placeholder:text-white/25 tracking-[-0.01em] " +
									(compact ? "text-base" : "text-lg")
								}
								placeholder={placeholder}
							/>
							<div className="hidden sm:flex items-center gap-2 text-[11px] text-white/40 tracking-[0.20em]">
								<span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">ENTER</span>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
})
