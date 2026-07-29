import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { prisma } from "@/lib/prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { document_type, template, document_data } = body

    if (!document_type || !document_data) {
      return NextResponse.json(
        { error: "document_type and document_data are required" },
        { status: 400 }
      )
    }

    // Attempt to save to Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from("shared_documents")
        .insert({
          document_type,
          template: template || "",
          document_data,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw error
      }

      if (data && data.id) {
        return NextResponse.json({ id: data.id })
      }
    }

    // Fallback to local SQLite database if Supabase is not configured
    console.warn("Supabase not configured or failed. Falling back to SQLite.")
    
    // Generate a temporary 8-char shortcode to act as ID
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let id = ""
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Store the combined document payload under prisma.shareLink
    const fallbackPayload = {
      docType: document_type,
      templateName: template,
      // Wrap it so it matches PreviewStoreItem shape
      ...(document_type === "template" || document_type === "payment-receipt"
        ? { invoiceData: document_data }
        : { data: document_data }),
      title: document_data.title || "Shared Document",
      fileName: document_data.fileName || "document.pdf",
    }

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Permanent (1 year fallback)
    await prisma.shareLink.create({
      data: {
        id,
        data: JSON.stringify(fallbackPayload),
        title: document_data.title || "Shared Document",
        expiresAt,
      },
    })

    return NextResponse.json({ id })
  } catch (error: any) {
    console.error("Share endpoint error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create public share link" },
      { status: 500 }
    )
  }
}
