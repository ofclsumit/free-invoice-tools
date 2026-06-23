import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const link = await prisma.shareLink.findUnique({ where: { id } })

    if (!link) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 })
    }

    if (new Date() > link.expiresAt) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 })
    }

    return NextResponse.json({
      id: link.id,
      data: JSON.parse(link.data),
      title: link.title,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Share link retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve share link" }, { status: 500 })
  }
}
