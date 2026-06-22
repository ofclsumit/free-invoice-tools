export function shareViaWhatsApp(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, "_blank")
}

export function shareViaEmail(subject: string, body: string) {
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(url, "_blank")
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }
  return Promise.resolve(false)
}

export function generateShareableLink(path: string): string {
  return `${window.location.origin}${path}`
}

export function downloadAsJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
