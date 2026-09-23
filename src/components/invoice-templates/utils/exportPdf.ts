export function printInvoice() {
  window.print()
}

export async function exportNodeToPdf(
  node: HTMLElement,
  fileName = "invoice.pdf",
  returnBlob = false,
  toolId?: string
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])

  // 1. Await Global Font Readiness to guarantee identical font metrics
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {}
  }

  // 2. Create an isolated, fixed A4 off-screen sandbox (Completely independent from preview zoom, pan, and mobile viewport)
  const sandbox = document.createElement("div")
  sandbox.setAttribute("id", "turnivo-pdf-render-sandbox")
  sandbox.style.position = "fixed"
  sandbox.style.left = "-99999px"
  sandbox.style.top = "0"
  sandbox.style.width = "793.7px" // Exact 210mm at 96 DPI
  sandbox.style.minWidth = "793.7px"
  sandbox.style.maxWidth = "793.7px"
  sandbox.style.margin = "0"
  sandbox.style.padding = "0"
  sandbox.style.backgroundColor = "#ffffff"
  sandbox.style.zIndex = "-99999"
  sandbox.style.pointerEvents = "none"
  sandbox.style.overflow = "visible"

  // Clone the exact live document HTML
  const clone = node.cloneNode(true) as HTMLElement
  clone.style.transform = "none"
  clone.style.transformOrigin = "unset"
  clone.style.height = "auto"
  clone.style.width = "793.7px"
  clone.style.minWidth = "793.7px"
  clone.style.maxWidth = "793.7px"
  clone.style.margin = "0"
  clone.style.boxSizing = "border-box"

  sandbox.appendChild(clone)
  document.body.appendChild(sandbox)

  let pdf: any = null

  try {
    // 3. Await all document images (logos, signatures, QR codes, icons)
    const images = Array.from(sandbox.querySelectorAll("img"))
    if (images.length > 0) {
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve()
              } else {
                img.onload = () => resolve()
                img.onerror = () => resolve()
                setTimeout(resolve, 1500)
              }
            })
        )
      )
    }

    // Short layout settling tick for clean CSS subpixel alignment
    await new Promise((r) => setTimeout(r, 60))

    const pageWidth = 210
    const pageHeight = 297

    // 4. Identify Discrete A4 Pages vs Continuous Flow
    let discretePages = Array.from(
      sandbox.querySelectorAll<HTMLElement>(
        ".pld-page, .sld-page, .pdf-page, .document-page, .invoice-sheet, .receipt-sheet, .resume-doc-canvas"
      )
    )

    if (
      discretePages.length === 0 &&
      (clone.classList.contains("pld-page") ||
        clone.classList.contains("sld-page") ||
        clone.classList.contains("document-page") ||
        clone.classList.contains("pdf-page") ||
        clone.classList.contains("invoice-sheet") ||
        clone.classList.contains("receipt-sheet") ||
        clone.classList.contains("resume-doc-canvas"))
    ) {
      discretePages = [clone]
    }

    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    })

    if (discretePages.length > 0) {
      // ─────────────────────────────────────────────────────────────
      // PIPELINE A: MULTI-PAGE DISCRETE A4 PAGES (PLD, SLD, INVOICES, RESUMES)
      // ─────────────────────────────────────────────────────────────
      for (let pageIdx = 0; pageIdx < discretePages.length; pageIdx++) {
        const pageEl = discretePages[pageIdx]
        if (pageIdx > 0) {
          pdf.addPage("a4", "portrait")
        }

        const pageRect = pageEl.getBoundingClientRect()
        const pxToMm = pageWidth / 793.7

        // Extract selectable vector text overlay
        const textNodes: { text: string; x: number; y: number; fontSize: number }[] = []

        function walkPage(el: Node) {
          if (el.nodeType === Node.TEXT_NODE) {
            const text = el.textContent?.trim()
            if (text && el.parentElement) {
              const style = window.getComputedStyle(el.parentElement)
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              ) {
                return
              }

              const range = document.createRange()
              range.selectNodeContents(el)
              const rects = range.getClientRects()
              if (rects.length > 0) {
                const rect = rects[0]
                const x = (rect.left - pageRect.left) * pxToMm
                const y = (rect.top - pageRect.top) * pxToMm
                const fontSizePx = parseFloat(style.fontSize) || 12
                const fontSizePt = fontSizePx * 0.75

                const cleanedText = text.replace(/\s+/g, " ")
                textNodes.push({ text: cleanedText, x, y, fontSize: fontSizePt })
              }
            }
          } else if (el.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(el as HTMLElement)
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            ) {
              return
            }
            for (let i = 0; i < el.childNodes.length; i++) {
              walkPage(el.childNodes[i])
            }
          }
        }

        walkPage(pageEl)

        const canvas = await html2canvas(pageEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: false,
          logging: false,
          windowWidth: 1200,
          width: 794,
          height: 1123,
        })

        const imgData = canvas.toDataURL("image/jpeg", 0.96)
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST")

        // Overlay selectable text for 100% digital search/copy
        pdf.setPage(pageIdx + 1)
        textNodes.forEach(({ text, x, y, fontSize }) => {
          const yOnPage = y + fontSize * 0.28
          pdf.setFontSize(fontSize)
          pdf.text(text, x, yOnPage, { renderingMode: "invisible" })
        })
      }
    } else {
      // ─────────────────────────────────────────────────────────────
      // PIPELINE B: CONTINUOUS A4 DOCUMENT PIPELINE
      // ─────────────────────────────────────────────────────────────
      const containerRect = clone.getBoundingClientRect()
      const pxToMm = pageWidth / (containerRect.width || 793.7)

      const textNodes: { text: string; x: number; y: number; fontSize: number }[] = []

      function walk(el: Node) {
        if (el.nodeType === Node.TEXT_NODE) {
          const text = el.textContent?.trim()
          if (text && el.parentElement) {
            const style = window.getComputedStyle(el.parentElement)
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            ) {
              return
            }

            const range = document.createRange()
            range.selectNodeContents(el)
            const rects = range.getClientRects()
            if (rects.length > 0) {
              const rect = rects[0]
              const x = (rect.left - containerRect.left) * pxToMm
              const y = (rect.top - containerRect.top) * pxToMm
              const fontSizePx = parseFloat(style.fontSize) || 12
              const fontSizePt = fontSizePx * 0.75

              const cleanedText = text.replace(/\s+/g, " ")
              textNodes.push({ text: cleanedText, x, y, fontSize: fontSizePt })
            }
          }
        } else if (el.nodeType === Node.ELEMENT_NODE) {
          const style = window.getComputedStyle(el as HTMLElement)
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0"
          ) {
            return
          }
          for (let i = 0; i < el.childNodes.length; i++) {
            walk(el.childNodes[i])
          }
        }
      }

      walk(clone)

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        logging: false,
        windowWidth: 1200,
        width: 794,
        height: clone.scrollHeight || 1123,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.96)
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight <= pageHeight * 1.02) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST")
      } else {
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST")
        heightLeft -= pageHeight

        while (heightLeft > 0) {
          position = position - pageHeight
          pdf.addPage("a4", "portrait")
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST")
          heightLeft -= pageHeight
        }
      }

      // Overlay invisible text nodes across paginated sheets
      textNodes.forEach(({ text, x, y, fontSize }) => {
        const pageIndex = Math.floor(y / pageHeight)
        const finalY = y % pageHeight
        const yOnPage = finalY + fontSize * 0.28

        if (pageIndex >= 0) {
          while (pdf.getNumberOfPages() <= pageIndex) {
            pdf.addPage("a4", "portrait")
          }
          pdf.setPage(pageIndex + 1)
          pdf.setFontSize(fontSize)
          pdf.text(text, x, yOnPage, { renderingMode: "invisible" })
        }
      })
    }
  } finally {
    // Clean up off-screen sandbox immediately
    if (document.body.contains(sandbox)) {
      document.body.removeChild(sandbox)
    }
  }

  if (pdf) {
    if (returnBlob) {
      return pdf.output("blob")
    }
    pdf.save(fileName)
    return pdf
  }
  return null
}

/**
 * Converts any HTML image element to a base64 data URL for self-contained offline portability
 */
async function inlineImageToBase64(img: HTMLImageElement): Promise<string> {
  const src = img.getAttribute("src") || img.src
  if (!src) return ""
  if (src.startsWith("data:")) return src

  try {
    const response = await fetch(src)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(src)
      reader.readAsDataURL(blob)
    })
  } catch {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth || img.width || 100
      canvas.height = img.naturalHeight || img.height || 100
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        return canvas.toDataURL("image/png")
      }
    } catch {}
    return src
  }
}

/**
 * Extracts and compiles all active styles and print rules into a standalone CSS string
 */
export function extractDocumentStyles(): string {
  let cssText = `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html {
      font-size: 14px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.5;
    }

    .document-page,
    .pld-page,
    .sld-page,
    .pdf-page,
    .invoice-sheet,
    .receipt-sheet,
    .resume-doc-canvas {
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      min-height: 297mm !important;
      background-color: #ffffff !important;
      margin: 0 auto 24px auto !important;
      box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04) !important;
      box-sizing: border-box !important;
      position: relative !important;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .turnivo-document-container {
        margin: 0 !important;
        padding: 0 !important;
      }
      .document-page,
      .pld-page,
      .sld-page,
      .pdf-page,
      .invoice-sheet,
      .receipt-sheet,
      .resume-doc-canvas {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .no-print {
        display: none !important;
      }
      table {
        page-break-inside: auto;
      }
      tr, th, td {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      thead {
        display: table-header-group;
      }
      tfoot {
        display: table-footer-group;
      }
    }
  `

  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i]
      try {
        const rules = sheet.cssRules || sheet.rules
        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j]
            if (rule.cssText && !rule.cssText.includes("no-print") && !rule.cssText.includes("@keyframes")) {
              cssText += "\n" + rule.cssText
            }
          }
        }
      } catch {}
    }
  } catch {}

  return cssText
}

/**
 * Generates clean, standalone self-contained HTML for any document node
 */
export async function generateStandaloneHtml(
  node: HTMLElement,
  title: string = "Document"
): Promise<string> {
  const clone = node.cloneNode(true) as HTMLElement

  clone.style.transform = "none"
  clone.style.transformOrigin = "unset"
  clone.style.height = "auto"
  clone.style.width = "210mm"
  clone.style.minWidth = "210mm"
  clone.style.maxWidth = "210mm"
  clone.style.margin = "0 auto"

  // In-line all images as base64 data URLs for 100% offline portability
  const originalImgs = Array.from(node.querySelectorAll("img"))
  const clonedImgs = Array.from(clone.querySelectorAll("img"))

  for (let i = 0; i < originalImgs.length; i++) {
    const origImg = originalImgs[i]
    const cloneImg = clonedImgs[i]
    if (origImg && cloneImg) {
      try {
        const dataUrl = await inlineImageToBase64(origImg)
        if (dataUrl) {
          cloneImg.setAttribute("src", dataUrl)
        }
      } catch {}
    }
  }

  // Remove any interactive UI / buttons from clone
  const noPrintEls = clone.querySelectorAll(".no-print, button")
  noPrintEls.forEach((el) => {
    el.remove()
  })

  const styles = extractDocumentStyles()
  const safeTitle = title.replace(/[<>&"]/g, "")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} – Turnivo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
${styles}
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; min-height: 100vh;">
  <div class="turnivo-document-container" style="width: 210mm; margin: 0 auto; box-sizing: border-box;">
    ${clone.outerHTML}
  </div>
</body>
</html>`
}

/**
 * Downloads the exact document node as a standalone .html file
 */
export async function exportNodeToHtml(
  node: HTMLElement,
  title: string = "Document",
  fileName?: string
): Promise<void> {
  const htmlContent = await generateStandaloneHtml(node, title)
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })

  let cleanName = fileName || `turnivo-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`
  if (!cleanName.endsWith(".html")) {
    cleanName = cleanName.replace(/\.[^/.]+$/, "") + ".html"
  }
  if (!cleanName.startsWith("turnivo-")) {
    cleanName = `turnivo-${cleanName}`
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = cleanName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
