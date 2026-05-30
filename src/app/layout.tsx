import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AnimationRuntime } from "@/components/AnimationRuntime"
import { Navbar } from "@/components/Navbar"
import { TransitionCurtain } from "@/components/TransitionCurtain"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Store Finder",
	description: "Awwwards-level store finder demo",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<AnimationRuntime />
				<Navbar />
				<TransitionCurtain />
				{children}
			</body>
		</html>
	)
}
