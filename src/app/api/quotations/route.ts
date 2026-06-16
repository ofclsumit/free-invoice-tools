import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth } from "@/lib/auth"

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unit: z.string().optional(),
  rate: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(28).default(0),
})

const quotationSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().optional(),
  clientAddress: z.string().optional(),
  quoteNumber: z.string().min(1),
  quoteDate: z.string(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

  const where: any = { userId: session.user.id }
  if (status && status !== "all") where.status = status.toUpperCase()

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where, include: { items: true, client: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit, take: limit,
    }),
    prisma.quotation.count({ where }),
  ])

  return NextResponse.json({ quotations, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = quotationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    let subtotal = 0, totalTax = 0, totalDiscount = 0

    const itemsData = data.items.map((item) => {
      const baseAmount = item.quantity * item.rate
      const discountAmount = (baseAmount * item.discount) / 100
      const taxableAmount = baseAmount - discountAmount
      const taxAmount = (taxableAmount * item.taxRate) / 100
      const total = taxableAmount + taxAmount

      subtotal += taxableAmount
      totalTax += taxAmount
      totalDiscount += discountAmount

      return {
        description: item.description, quantity: item.quantity, unit: item.unit,
        rate: item.rate, discount: item.discount, taxRate: item.taxRate,
        amount: taxableAmount, taxAmount, total,
      }
    })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    const quotation = await prisma.quotation.create({
      data: {
        userId: session.user.id,
        clientId: data.clientId,
        quoteNumber: data.quoteNumber,
        quoteDate: new Date(data.quoteDate),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        businessName: user?.businessName,
        businessGstin: user?.gstin,
        businessAddress: user?.address,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        subtotal, discountAmount: totalDiscount, taxAmount: totalTax,
        totalAmount: subtotal + totalTax,
        notes: data.notes, terms: data.terms,
        items: { create: itemsData },
      },
      include: { items: true },
    })

    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error) {
    console.error("Quotation creation error:", error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}
