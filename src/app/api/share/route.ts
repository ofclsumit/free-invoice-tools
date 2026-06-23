import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { invoiceData, template, title } = body

    if (!invoiceData) {
      return NextResponse.json({ error: "invoiceData is required" }, { status: 400 })
    }

    const id = generateShortCode()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000)

    const payload = JSON.stringify({ invoiceData, template: template || "StudioTemplate" })

    await prisma.shareLink.create({
      data: {
        id,
        data: payload,
        title: title || null,
        expiresAt,
      },
    })

    return NextResponse.json({ id, expiresAt: expiresAt.toISOString() })
  } catch (error) {
    console.error("Share link creation error:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
