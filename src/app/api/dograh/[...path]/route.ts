import { NextRequest, NextResponse } from "next/server"

const DOGRAH_BASE = process.env.DOGRAH_SERVICE_URL || "http://127.0.0.1:8080"

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const joined = path.join("/")
    const search = req.nextUrl.search

    // Route /health or /voice/*
    const targetUrl = joined === "health" 
      ? `${DOGRAH_BASE}/health` 
      : `${DOGRAH_BASE}/api/v1/${joined}${search}`

    const res = await fetch(targetUrl, {
      headers: {
        Accept: req.headers.get("accept") || "*/*",
      },
    })

    if (!res.ok) {
      return new NextResponse(`Dograh Pipecat Error: ${res.statusText}`, { status: res.status })
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream"

    if (contentType.includes("audio")) {
      const buffer = await res.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to connect to self-hosted Dograh Pipecat service", details: String(err) },
      { status: 502 }
    )
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const joined = path.join("/")
    const body = await req.json()

    const targetUrl = `${DOGRAH_BASE}/api/v1/${joined}`

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to communicate with self-hosted Dograh Pipecat service", details: String(err) },
      { status: 502 }
    )
  }
}
