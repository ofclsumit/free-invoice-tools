import React, { useRef, useState, useEffect } from "react";
import { printInvoice, exportNodeToPdf } from "../utils/exportPdf";

interface Props {
  children: React.ReactNode;
  fileName?: string;
  /** Hide the toolbar — useful when embedding inside your own app chrome */
  hideToolbar?: boolean;
}

/**
 * InvoicePreview wraps any of the 5 templates and provides:
 *  - the #invoice-print-root id required by styles/print.css
 *  - automatic scale-to-fit on narrow (mobile) viewports, so the
 *    fixed 210mm-wide A4 sheet previews correctly on a phone instead
 *    of overflowing or forcing horizontal scroll
 *  - a small toolbar with "Print" (native dialog → Save as PDF) and
 *    "Download PDF" (html2canvas + jsPDF raster export) actions
 *
 * Usage:
 *   <InvoicePreview fileName="invoice-INV-0143.pdf">
 *     <LedgerTemplate invoice={data} />
 *   </InvoicePreview>
 */
export default function InvoicePreview({
  children,
  fileName = "invoice.pdf",
  hideToolbar = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const A4_WIDTH_PX = 794; // 210mm at 96dpi
      const available = containerRef.current.clientWidth - 24; // small padding
      setScale(available < A4_WIDTH_PX ? available / A4_WIDTH_PX : 1);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  async function handleDownload() {
    if (!pageRef.current) return;
    setExporting(true);
    try {
      await exportNodeToPdf(pageRef.current, fileName);
    } finally {
      setExporting(false);
    }
  }

  if (hideToolbar) {
    return (
      <div id="invoice-print-root" ref={pageRef} style={{ width: "100%", margin: "0 auto" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="no-print flex items-center justify-end gap-2 mb-4 px-1">
        <button
          onClick={printInvoice}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Print
        </button>
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {exporting ? "Generating…" : "Download PDF"}
        </button>
      </div>

      <div ref={containerRef} className="invoice-page-mobile-scale-wrapper">
        <div
          id="invoice-print-root"
          ref={pageRef}
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
            height: scale < 1 ? `${297 * scale * 3.7795}px` : undefined,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
