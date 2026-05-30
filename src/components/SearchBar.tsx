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
	{
		value,
		onChange,
		onSubmit,
		onFocus,
		onBlur,
		placeholder = "Berlin, coffee, supermarket…",
		compact,
	},
	ref,
) {
	return (
		<div
			ref={ref}
			data-search-shell
			className={
				"rounded-2xl border border-white/15 bg-white/5 backdrop-blur px-5 py-4 " +
				(compact ? "py-3" : "")
			}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onSubmit()
				}}
			>
				<label className="block text-sm text-white/60">Search</label>
				<input
					suppressHydrationWarning
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={onFocus}
					onBlur={onBlur}
					className={
						"mt-2 w-full bg-transparent outline-none text-lg placeholder:text-white/30 " +
						(compact ? "text-base" : "")
					}
					placeholder={placeholder}
				/>
			</form>
		</div>
	)
})
