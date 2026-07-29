import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, data, title } = body
    if (!id || !data) {
      return NextResponse.json({ error: "id and data are required" }, { status: 400 })
    }
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    await prisma.shareLink.create({
      data: { id, data: JSON.stringify(data), title: title || null, expiresAt },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Preview save error:", error)
    return NextResponse.json({ error: "Failed to save preview" }, { status: 500 })
  }
}
