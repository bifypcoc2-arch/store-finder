import { NextResponse } from "next/server"

export const runtime = "nodejs"

type OverpassElement = {
	type: "node" | "way" | "relation"
	id: number
	lat?: number
	lon?: number
	tags?: Record<string, string>
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const q = (searchParams.get("q") ?? "").trim()

	if (!q) {
		return NextResponse.json({ elements: [] as OverpassElement[] })
	}

	// Safe-ish: only letters/numbers/basic punctuation/spaces
	const cleaned = q.replace(/[^\p{L}\p{N}\s\-,'".]/gu, "").slice(0, 80)

	// Minimal query: search POIs by name in areas matching the query
	// NOTE: Overpass "geocode" isn't built-in; this is a simple heuristic.
	const overpassQuery = `
[out:json][timeout:25];
(
  nwr["name"~"${cleaned}", i];
);
out tags center 30;
`.trim()

	const r = await fetch("https://overpass-api.de/api/interpreter", {
		method: "POST",
		headers: { "content-type": "text/plain;charset=UTF-8" },
		body: overpassQuery,
	})

	if (!r.ok) {
		return NextResponse.json(
			{ error: "Overpass error", status: r.status },
			{ status: 502 },
		)
	}

	const data = (await r.json()) as { elements?: OverpassElement[] }
	return NextResponse.json({ elements: data.elements ?? [] })
}