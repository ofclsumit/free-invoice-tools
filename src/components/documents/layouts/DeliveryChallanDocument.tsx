import React from "react"
import { InvoiceData } from "@/components/invoice-templates/data/invoiceTypes"
import { sheetStyle, Watermark } from "./shared"

interface DocumentProps {
  invoice: InvoiceData
  className?: string
}

export function DeliveryChallanDocument({ invoice, className = "" }: DocumentProps) {
  const { company, billTo, shipTo, transportDetails } = invoice
  const totalQty = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return (
    <div
      className={`challan-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Logistics Notice */}
        <div className="mb-4 py-1.5 px-3 bg-[#111111] text-white rounded text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest">
            Goods Transport & Delivery Document • Not a Tax Invoice • For Cargo Movement & Receipt Acknowledgement
          </p>
        </div>

        {/* Header */}
        <header className="pb-5 border-b-2 border-[#111111] flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 max-w-[55%]">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt="Logo"
                className="h-14 max-w-[150px] object-contain shrink-0 rounded border border-[#E5E5E5] p-1"
              />
            )}
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Consignor (Dispatching Entity)</span>
              <h1 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight">
                {company.name || "Company Name"}
              </h1>
              {company.addressLines && (
                <p className="text-[14px] text-[#444444] leading-normal">{company.addressLines.filter(Boolean).join(", ")}</p>
              )}
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#444444] pt-0.5">
                {company.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
              {company.gstin && (
                <p className="text-[14px] text-[#111111] pt-0.5">
                  <strong className="text-[#444444]">GSTIN:</strong> <span className="font-mono font-bold">{company.gstin}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[230px]">
            <h2 className="text-[24px] font-black uppercase tracking-tight text-[#111111]">
              DELIVERY CHALLAN
            </h2>
            <div className="mt-2 text-[14px] space-y-1.5">
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Challan No:</span>
                <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Dispatch Date:</span>
                <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
              </div>
              {(invoice as any).purchaseOrderNumber && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Order / Indent Ref:</span>
                  <span className="font-mono font-bold text-[#111111]">{(invoice as any).purchaseOrderNumber}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Transport & Vehicle Details Strip */}
        <section className="my-4 p-3 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-[13.5px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#333333] border-b border-[#E0E0E0] pb-1 mb-2">
            Dispatch & Logistics Details
          </p>
          <div className="grid grid-cols-4 gap-3 text-[13.5px]">
            <div>
              <span className="text-[#666666] block text-[11px] uppercase">Mode of Transport:</span>
              <strong className="text-[#111111]">{transportDetails?.modeOfTransport || (transportDetails as any)?.mode || "Road"}</strong>
            </div>
            <div>
              <span className="text-[#666666] block text-[11px] uppercase">Vehicle Number:</span>
              <strong className="font-mono text-[#111111]">{transportDetails?.vehicleNumber || "—"}</strong>
            </div>
            <div>
              <span className="text-[#666666] block text-[11px] uppercase">LR / GR Number:</span>
              <strong className="font-mono text-[#111111]">{(transportDetails as any)?.lrNumber || transportDetails?.transportDocNo || "—"}</strong>
            </div>
            <div>
              <span className="text-[#666666] block text-[11px] uppercase">Transporter Name:</span>
              <strong className="text-[#111111]">{transportDetails?.transporterName || "Direct / Hand Delivery"}</strong>
            </div>
          </div>
        </section>

        {/* Parties: Consignor vs Consignee */}
        <section className="my-3 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Consignee (Billed To)
            </p>
            <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Consignee Name"}</p>
            {billTo.addressLines && (
              <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>
            )}
            <div className="text-[14px] text-[#444444] pt-0.5 space-y-0.5">
              {billTo.phone && <p><strong>Contact:</strong> {billTo.phone}</p>}
              {billTo.gstin && <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-[#111111]">{billTo.gstin}</span></p>}
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Delivery Destination (Ship To Site / Warehouse)
            </p>
            {shipTo?.name ? (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{shipTo.name}</p>
                {shipTo.addressLines && <p className="text-[14px] text-[#444444] leading-normal">{shipTo.addressLines.filter(Boolean).join(", ")}</p>}
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Same as Consignee"}</p>
                {billTo.addressLines && <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>}
              </>
            )}
          </div>
        </section>

        {/* Quantity & Packaging Focused Logistics Table (NO PRICING/RATES) */}
        <section className="my-2 flex-1">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[#333333] mb-1.5 flex justify-between">
            <span>Particulars of Cargo / Goods Dispatched</span>
            <span className="text-[11px] text-[#666666] font-medium">Quantity verification mandatory upon delivery</span>
          </div>
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#181818] text-white text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 border-r border-[#333333] w-12 text-center">Package #</th>
                <th className="py-2.5 px-3 border-r border-[#333333]">Description of Goods / Cargo Material</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-28 text-center">HSN/SAC Code</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-24 text-right">Dispatched Qty</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-20 text-center">Unit</th>
                <th className="py-2.5 px-3 text-left w-48">Remarks / Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6] text-[14px]">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}>
                  <td className="py-2.5 px-3 text-center text-[#555555] border-r border-[#D6D6D6] font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r border-[#D6D6D6]">
                    <p className="font-semibold text-[#111111]">{item.description}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[13px] border-r border-[#D6D6D6] text-[#444444]">
                    {item.hsnSac || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#111111] border-r border-[#D6D6D6]">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#555555] border-r border-[#D6D6D6]">
                    {item.unit || "NOS"}
                  </td>
                  <td className="py-2.5 px-3 text-left text-[13px] text-[#666666]">
                    Standard Packaging / Sound
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Quantity Summary & Notes */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6 items-start">
          <div className="col-span-8 space-y-2">
            {invoice.notes ? (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Handling Instructions & Challan Notes:</strong>
                <p className="whitespace-pre-line mt-0.5">{invoice.notes}</p>
              </div>
            ) : (
              <p className="text-[12px] text-[#666666] italic">
                Goods once dispatched should be checked by the consignee for count and physical condition before signing receipt.
              </p>
            )}
          </div>

          <div className="col-span-4 p-3 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-right space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#555555] block">Total Units Dispatched</span>
            <span className="text-[20px] font-mono font-bold text-[#111111] block">{totalQty} Units</span>
            <span className="text-[11px] text-[#666666] block">{invoice.items.length} Distinct Line Items</span>
          </div>
        </div>

        {/* Dual Logistics Acknowledgement Sign-Off */}
        <section className="mt-8 pt-4 border-t-2 border-[#111111] grid grid-cols-2 gap-8">
          {/* Dispatcher Signatory */}
          <div className="space-y-1 text-left">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">Dispatched & Verified By</p>
            <p className="text-[14px] font-semibold text-[#333333]">{company.name || "Company"}</p>
            {(company.signatureUrl || (invoice as any).signatureUrl) ? (
              <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-10 max-w-[130px] object-contain my-1" />
            ) : (
              <div className="h-8" />
            )}
            <div className="border-t border-[#888888] pt-1 max-w-[200px]">
              <p className="text-[11px] text-[#666666] uppercase">Consignor Authorized Signature</p>
            </div>
          </div>

          {/* Consignee Receipt Acknowledgement */}
          <div className="p-3 bg-[#FAFAFA] border border-[#D6D6D6] rounded text-left space-y-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#111111] border-b border-[#E0E0E0] pb-1">
              Consignee Receipt Acknowledgement
            </p>
            <p className="text-[11.5px] text-[#555555] italic">
              Received the cargo/goods detailed above in full quantity and sound exterior condition with no damages observed.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="border-b border-[#999999] pb-0.5">
                <span className="text-[10px] text-[#666666] uppercase block">Receiver Name & Contact:</span>
              </div>
              <div className="border-b border-[#999999] pb-0.5">
                <span className="text-[10px] text-[#666666] uppercase block">Consignee Signature & Stamp:</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
