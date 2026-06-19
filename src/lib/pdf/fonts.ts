let regularFont: { data: Uint8Array; format: "truetype" } | null = null
let boldFont: { data: Uint8Array; format: "truetype" } | null = null
let italicFont: { data: Uint8Array; format: "truetype" } | null = null

async function fetchFont(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  return { data: new Uint8Array(buf), format: "truetype" as const }
}

export async function loadFonts(): Promise<void> {
  if (regularFont) return
  try {
    const [reg, bold, italic] = await Promise.all([
      fetchFont("/fonts/Inter-Regular.ttf"),
      fetchFont("/fonts/Inter-Bold.ttf"),
      fetchFont("/fonts/Inter-Italic.ttf"),
    ])
    regularFont = reg
    boldFont = bold
    italicFont = italic
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
  if (regularFont && boldFont && italicFont) {
    Font.register({
      family: "Inter",
      fonts: [
        { src: regularFont, fontWeight: 400 },
        { src: boldFont, fontWeight: 700 },
        { src: italicFont, fontWeight: 400, fontStyle: "italic" },
      ],
    })
    return
  }

  console.warn("[PDF] Fonts not preloaded, registering with URLs")
  Font.register({ family: "Inter", fonts: URL_FONTS })
}
