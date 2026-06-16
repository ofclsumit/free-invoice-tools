import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const quotation = await prisma.quotation.findFirst({
    where: { id: id, userId: session.user.id },
    include: { items: true },
  })

  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
  }

  if (quotation.status === "CONVERTED") {
    return NextResponse.json({ error: "Quotation already converted" }, { status: 409 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const invoiceNumber = `${user?.invoicePrefix || "INV"}-${new Date().getFullYear()}-${String(user?.nextInvoiceNo || 1).padStart(4, "0")}`

  // GST defaults to 18% CGST+SGST when converting (since quotation doesn't track GST type)
  const invoice = await prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoice.create({
      data: {
        userId: session.user.id,
        clientId: quotation.clientId,
        invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        businessName: quotation.businessName,
        businessGstin: quotation.businessGstin,
        businessAddress: quotation.businessAddress,
        clientName: quotation.clientName,
        clientEmail: quotation.clientEmail,
        clientAddress: quotation.clientAddress,
        subtotal: quotation.subtotal,
        discountAmount: quotation.discountAmount,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        notes: quotation.notes,
        terms: quotation.terms,
        items: {
          create: quotation.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
            discount: item.discount,
            gstRate: item.taxRate,
            gstType: "CGST_SGST" as const,
            amount: item.amount,
            taxAmount: item.taxAmount,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    })

    await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: "CONVERTED", convertedInvoiceId: newInvoice.id },
    })

    await tx.user.update({
      where: { id: session.user.id },
      data: { nextInvoiceNo: { increment: 1 } },
    })

    return newInvoice
  })

  return NextResponse.json({ invoice }, { status: 201 })
}
