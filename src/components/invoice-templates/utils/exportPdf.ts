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
    const canvas = await html2canvas(node, {
      scale: 2,
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

    const pageWidth = 210
    const pageHeight = 297
    const margin = 10
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    const imgWidth = usableWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

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
  } finally {
    node.style.transform = originalTransform
    node.style.transformOrigin = originalTransformOrigin
    node.style.height = originalHeight
  }

  if (pdf) {
    if (returnBlob) {
      return pdf.output('blob');
    }
    pdf.save(fileName)
  }
  return null;
}
