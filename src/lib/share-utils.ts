"use client"

export function encodeShareData(data: unknown): string {
  try {
    const json = JSON.stringify(data)
    const encoded = encodeURIComponent(json)
    const base64 = btoa(encoded)
    return base64
  } catch {
    return ""
  }
}

export function decodeShareData(encoded: string): unknown {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function buildShareUrl(data: unknown): string {
  const encoded = encodeShareData(data)
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/share?d=${encodeURIComponent(encoded)}`
}

export async function tryNativeShare(blob: Blob, fileName: string, title: string, text: string): Promise<boolean> {
  try {
    const file = new File([blob], fileName, { type: "application/pdf" })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text, files: [file] })
      return true
    }
  } catch {}
  return false
}

export async function generateShareUrl(invoiceData: unknown, template: string, title: string): Promise<string> {
  return buildShareUrl({ invoiceData, template, title, _t: Date.now() })
}

export function openWhatsApp(message: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
}

export function openEmail(to: string, subject: string, body: string) {
  window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank")
}
