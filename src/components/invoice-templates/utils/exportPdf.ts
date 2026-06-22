/**
 * Print & PDF export helpers.
 *
 * Two supported paths:
 *
 * 1) BROWSER PRINT (recommended, zero dependencies):
 *    Calling `printInvoice()` opens the native print dialog. Combined
 *    with the print stylesheet in `styles/print.css`, the browser's
 *    "Save as PDF" destination produces a pixel-accurate A4 PDF.
 *    This is what Zoho/QuickBooks/FreshBooks effectively do under
 *    the hood for their "Download PDF" buttons.
 *
 * 2) CLIENT-SIDE RASTER EXPORT (no print dialog, e.g. for a one-click
 *    "Download PDF" button): uses html2canvas + jsPDF. Install with:
 *      npm install html2canvas jspdf
 *    Use `exportNodeToPdf()` below.
 */

export function printInvoice() {
  window.print();
}

export async function exportNodeToPdf(
  node: HTMLElement,
  fileName = "invoice.pdf"
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(node, {
    scale: 2, // higher scale = sharper PDF text/lines
    useCORS: true, // allow logo images hosted on other domains
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 in mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Paginate if content overflows a single A4 page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
