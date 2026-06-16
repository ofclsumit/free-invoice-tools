import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const invoice = await prisma.invoice.findFirst({
    where: { id: id, userId: session.user.id },
    include: { items: true, client: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  return NextResponse.json({ invoice })
}

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"]),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  // Ensure the invoice belongs to the requesting user (authorization check)
  const existing = await prisma.invoice.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updateData: any = { status: parsed.data.status }
    if (parsed.data.status === "PAID") updateData.paidAt = new Date()
    if (parsed.data.status === "SENT") updateData.sentAt = new Date()
    if (parsed.data.status === "VIEWED" && !existing.viewedAt) updateData.viewedAt = new Date()

    const invoice = await prisma.invoice.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Invoice update error:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.invoice.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  await prisma.invoice.delete({ where: { id: id } })
  return NextResponse.json({ success: true })
}
