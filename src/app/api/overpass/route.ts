import { NextResponse } from "next/server"

export const runtime = "nodejs"

type OverpassElement = {
	type: "node" | "way" | "relation"
	id: number
	lat?: number
	lon?: number
	tags?: Record<string, string>
}

const ENDPOINTS = [
	"https://overpass-api.de/api/interpreter",
	"https://overpass.kumi.systems/api/interpreter",
	"https://overpass.nchc.org.tw/api/interpreter",
] as const

async function fetchWithTimeout(
	url: string,
	args: RequestInit,
	ms: number,
): Promise<Response> {
	const ac = new AbortController()
	const t = setTimeout(() => ac.abort(), ms)
	try {
		return await fetch(url, { ...args, signal: ac.signal })
	} finally {
		clearTimeout(t)
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const q = (searchParams.get("q") ?? "").trim()

	if (!q) {
		return NextResponse.json({ elements: [] as OverpassElement[] })
	}

	// Safe-ish: only letters/numbers/basic punctuation/spaces
	const cleaned = q.replace(/[^\p{L}\p{N}\s\-,'".]/gu, "").slice(0, 80)

	const overpassQuery = `
[out:json][timeout:25];
(
  nwr["name"~"${cleaned}", i];
);
out tags center 30;
`.trim()

	let lastErr: unknown = null

	for (const endpoint of ENDPOINTS) {
		try {
			const r = await fetchWithTimeout(
				endpoint,
				{
					method: "POST",
					headers: { "content-type": "text/plain;charset=UTF-8" },
					body: overpassQuery,
				},
				25_000,
			)

			if (!r.ok) {
				lastErr = new Error(`Overpass HTTP ${r.status} from ${endpoint}`)
				continue
			}

			const data = (await r.json()) as { elements?: OverpassElement[] }
			return NextResponse.json({ elements: data.elements ?? [] })
		} catch (e) {
			lastErr = e
			continue
		}
	}

	return NextResponse.json(
		{
			error: "Overpass unreachable",
			details: String((lastErr as any)?.message ?? lastErr ?? "unknown"),
		},
		{ status: 502 },
	)
}
