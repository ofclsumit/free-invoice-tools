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
      return NextResponse.json({ error: "Preview not found" }, { status: 404 })
    }
    return NextResponse.json({ data: JSON.parse(link.data) })
  } catch (error) {
    console.error("Preview load error:", error)
    return NextResponse.json({ error: "Failed to load preview" }, { status: 500 })
  }
}
