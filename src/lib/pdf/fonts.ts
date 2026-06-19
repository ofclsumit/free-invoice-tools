let regularURI: string | null = null
let boldURI: string | null = null
let italicURI: string | null = null

async function fetchFontAsDataURI(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:font/ttf;base64,${btoa(binary)}`
}

export async function loadFonts(): Promise<void> {
  if (regularURI) return
  try {
    const [reg, bold, italic] = await Promise.all([
      fetchFontAsDataURI("/fonts/Inter-Regular.ttf"),
      fetchFontAsDataURI("/fonts/Inter-Bold.ttf"),
      fetchFontAsDataURI("/fonts/Inter-Italic.ttf"),
    ])
    regularURI = reg
    boldURI = bold
    italicURI = italic
  } catch (err) {
    console.error("[PDF] Failed to load font files:", err)
    throw err
  }
}

const URL_FONTS = [
  { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
  { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
  { src: "/fonts/Inter-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
]

export function registerFonts(Font: any): void {
  if (regularURI && boldURI && italicURI) {
    Font.register({
      family: "Inter",
      fonts: [
        { src: regularURI, fontWeight: 400 },
        { src: boldURI, fontWeight: 700 },
        { src: italicURI, fontWeight: 400, fontStyle: "italic" },
      ],
    })
    return
  }

  console.warn("[PDF] Fonts not preloaded, registering with URLs")
  Font.register({ family: "Inter", fonts: URL_FONTS })
}
