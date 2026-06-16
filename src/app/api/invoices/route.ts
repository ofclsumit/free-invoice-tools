import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth } from "@/lib/auth"

const lineItemSchema = z.object({
  description: z.string().min(1),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01),
  unit: z.string().optional(),
  rate: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  gstRate: z.number().min(0).max(28).default(18),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
})

const invoiceSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientGstin: z.string().optional(),
  clientAddress: z.string().optional(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1),
})

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(userId)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (record.count >= limit) return false
  record.count++
  return true
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

  const where: any = { userId: session.user.id }
  if (status && status !== "all") where.status = status.toUpperCase()
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
    ]
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { items: true, client: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ])

  return NextResponse.json({ invoices, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
  }

  try {
    const body = await req.json()
    const parsed = invoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Calculate totals server-side (never trust client calculations)
    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0, discountTotal = 0

    const itemsData = data.items.map((item) => {
      const baseAmount = item.quantity * item.rate
      const discountAmount = (baseAmount * item.discount) / 100
      const taxableAmount = baseAmount - discountAmount

      let cgst = 0, sgst = 0, igst = 0
      if (item.gstType === "CGST_SGST") {
        cgst = (taxableAmount * item.gstRate) / 200
        sgst = cgst
      } else if (item.gstType === "IGST") {
        igst = (taxableAmount * item.gstRate) / 100
      }

      const taxAmount = cgst + sgst + igst
      const total = taxableAmount + taxAmount

      subtotal += taxableAmount
      cgstTotal += cgst
      sgstTotal += sgst
      igstTotal += igst
      discountTotal += discountAmount

      return {
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        discount: item.discount,
        gstRate: item.gstRate,
        gstType: item.gstType,
        amount: taxableAmount,
        taxAmount,
        total,
      }
    })

    const totalTax = cgstTotal + sgstTotal + igstTotal
    const totalAmount = subtotal + totalTax

    // Fetch business profile for snapshot
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        businessName: user?.businessName,
        businessGstin: user?.gstin,
        businessAddress: user?.address,
        businessLogo: user?.logo,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientGstin: data.clientGstin,
        clientAddress: data.clientAddress,
        subtotal,
        discountAmount: discountTotal,
        taxAmount: totalTax,
        cgstAmount: cgstTotal,
        sgstAmount: sgstTotal,
        igstAmount: igstTotal,
        totalAmount,
        notes: data.notes,
        terms: data.terms,
        items: { create: itemsData },
      },
      include: { items: true },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error("Invoice creation error:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
