let registered = false

export function registerInvoiceFonts(Font: { register: (data: any) => void }): void {
  if (registered) return

  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Inter-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    ],
  })

  registered = true
}

export function resetFontRegistration(): void {
  registered = false
}
