export function printInvoice() {
  window.print()
}

export async function exportNodeToPdf(
  node: HTMLElement,
  fileName = "invoice.pdf",
  returnBlob = false
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])

  const originalTransform = node.style.transform
  const originalTransformOrigin = node.style.transformOrigin
  const originalHeight = node.style.height

  node.style.transform = "none"
  node.style.transformOrigin = "unset"
  node.style.height = "auto"

  let pdf: any = null

  try {
    const containerRect = node.getBoundingClientRect()
    
    const pageWidth = 210
    const pageHeight = 297
    const margin = 10
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    const pxToMm = usableWidth / containerRect.width

    // Extract text nodes with dimensions to construct the selectable vector overlay layer
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
            const x = (rect.left - containerRect.left) * pxToMm + margin
            const y = (rect.top - containerRect.top) * pxToMm + margin
            const fontSizePx = parseFloat(style.fontSize) || 12
            const fontSizePt = fontSizePx * 0.75 // Convert pixels to points (72 / 96)
            
            // Normalize inner whitespace to match browser text collapse
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

    walk(node)

    // Render high resolution document canvas (scale: 3 for crisp Retina print standard)
    const canvas = await html2canvas(node, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      allowTaint: false,
      logging: false,
      width: node.scrollWidth,
      height: node.scrollHeight,
    })

    const imgData = canvas.toDataURL("image/jpeg", 0.95)

    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = usableWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Render image frames onto the PDF pages
    if (imgHeight <= usableHeight * 1.10) {
      let finalW = imgWidth
      let finalH = imgHeight
      let x = margin

      if (imgHeight > usableHeight) {
        const s = usableHeight / imgHeight
        finalW = imgWidth * s
        finalH = imgHeight * s
        x = margin + (usableWidth - finalW) / 2
      }

      pdf.addImage(imgData, "JPEG", x, margin, finalW, finalH)
    } else {
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "JPEG", margin, position + margin, imgWidth, imgHeight)
      heightLeft -= usableHeight

      while (heightLeft > 0) {
        position = position - usableHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", margin, position + margin, imgWidth, imgHeight)
        heightLeft -= usableHeight
      }
    }

    // Overlay invisible text nodes on top of the images for selection/copy capabilities
    textNodes.forEach(({ text, x, y, fontSize }) => {
      const pageIndex = Math.floor((y - margin) / usableHeight)
      const yOnPage = ((y - margin) % usableHeight) + margin + (fontSize * 0.28) // Adjust baseline

      if (pageIndex >= 0) {
        // Direct focus to corresponding page (1-based index)
        while (pdf.getNumberOfPages() <= pageIndex) {
          pdf.addPage()
        }
        pdf.setPage(pageIndex + 1)
        pdf.setFontSize(fontSize)
        pdf.text(text, x, yOnPage, { renderingMode: "invisible" })
      }
    })

  } finally {
    node.style.transform = originalTransform
    node.style.transformOrigin = originalTransformOrigin
    node.style.height = originalHeight
  }

  if (pdf) {
    if (returnBlob) {
      return pdf.output("blob")
    }
    pdf.save(fileName)
  }
  return null
}
