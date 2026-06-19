let regularBuffer: ArrayBuffer | null = null
let boldBuffer: ArrayBuffer | null = null
let italicBuffer: ArrayBuffer | null = null

export async function loadFonts(): Promise<void> {
  if (regularBuffer) return
  try {
    const [reg, bold, italic] = await Promise.all([
      fetch("/fonts/Inter-Regular.ttf").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.arrayBuffer()
      }),
      fetch("/fonts/Inter-Bold.ttf").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.arrayBuffer()
      }),
      fetch("/fonts/Inter-Italic.ttf").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.arrayBuffer()
      }),
    ])
    regularBuffer = reg
    boldBuffer = bold
    italicBuffer = italic
  } catch (err) {
    console.error("[PDF] Failed to load font files:", err)
    throw err
  }
}

export function registerFonts(Font: any): void {
  if (regularBuffer && boldBuffer && italicBuffer) {
    Font.register({
      family: "Inter",
      fonts: [
        { src: regularBuffer, fontWeight: 400 },
        { src: boldBuffer, fontWeight: 700 },
        { src: italicBuffer, fontWeight: 400, fontStyle: "italic" },
      ],
    })
    return
  }

  console.warn("[PDF] Fonts not preloaded, registering with URLs")
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Inter-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    ],
  })
}
