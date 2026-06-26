import React from "react"
import type { InvoiceData } from "@/components/invoice-templates/data/invoiceTypes"
import s from "./styles.module.css"

interface Props {
  invoice: InvoiceData
  className?: string
}

function parseMeta(invoice: InvoiceData) {
  const notes = invoice.notes || ""
  const paymentMethod = notes.match(/Payment Method:\s*(.+)/)?.[1] || "Cash"
  const purpose = notes.match(/Purpose:\s*(.+)/)?.[1] || invoice.items?.[0]?.description || "—"
  const receivedBy = notes.match(/Received By:\s*(.+)/)?.[1] || invoice.company.name
  return { paymentMethod, purpose, receivedBy }
}

export default function CarbonReceipt({ invoice, className = "" }: Props) {
  const { paymentMethod, purpose, receivedBy } = parseMeta(invoice)
  const amount = invoice.amountPaid ?? invoice.items.reduce((s, i) => s + i.rate * i.quantity, 0)
  const addrParts = invoice.billTo.addressLines || []

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  return (
    <div className={`${s.receipt} ${s.carbon} ${className}`}>
      <div className={s.carbonWatermark}>
        <svg viewBox="0 0 750 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.watermarkSvg}>
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="#00E0C0" opacity="0.15"/>
            </pattern>
          </defs>
          <rect width="750" height="320" fill="url(#dotgrid)"/>
          <path d="M20 20 L20 50 M20 20 L50 20" stroke="#00E0C0" strokeWidth="1.5" opacity="0.4"/>
          <path d="M730 20 L730 50 M730 20 L700 20" stroke="#00E0C0" strokeWidth="1.5" opacity="0.4"/>
          <path d="M20 300 L20 270 M20 300 L50 300" stroke="#00E0C0" strokeWidth="1.5" opacity="0.4"/>
          <path d="M730 300 L730 270 M730 300 L700 300" stroke="#00E0C0" strokeWidth="1.5" opacity="0.4"/>
          <line x1="52" y1="160" x2="200" y2="160" stroke="#00E0C0" strokeWidth="0.5" opacity="0.2"/>
          <circle cx="200" cy="160" r="2" fill="#00E0C0" opacity="0.3"/>
          <line x1="202" y1="160" x2="220" y2="160" stroke="#00E0C0" strokeWidth="0.5" opacity="0.1"/>
        </svg>
      </div>
      <div className={s.carbonContent}>
        <div className={s.carbonLeftPanel}>
          <div className={s.carbonVerticalText}>Cash Receipt</div>
        </div>
        <div className={s.carbonMainBody}>
          <div className={s.carbonHeaderRow}>
            <div style={{display: "flex", alignItems: "center", gap: 10}}>
              {invoice.company.logoUrl && (
                <img src={invoice.company.logoUrl} alt="Logo" className={s.logo} style={{filter: "brightness(0) invert(1) opacity(0.9)"}} />
              )}
              <div>
                <div className={s.carbonReceiptTitle}>CASH <span className={s.carbonReceiptTitleAccent}>RECEIPT</span></div>
              </div>
            </div>
            <div className={s.carbonMetaStrip}>
              <div className={s.carbonMetaCell}>
                <span className={s.carbonMetaLabel}>No.</span>
                <span className={s.carbonMetaValue}>{invoice.invoiceNumber}</span>
              </div>
              <div className={s.carbonMetaCell}>
                <span className={s.carbonMetaLabel}>Date</span>
                <span className={s.carbonMetaValue}>{invoice.invoiceDate}</span>
              </div>
              <div className={s.carbonMetaCell}>
                <span className={s.carbonMetaLabel}>Method</span>
                <span className={s.carbonMetaValue}>{paymentMethod}</span>
              </div>
              <div className={s.carbonMetaCell}>
                <span className={s.carbonMetaLabel}>Amount</span>
                <span className={`${s.carbonMetaValue} ${s.carbonAmountValue}`}>{invoice.currencySymbol}{fmt(amount)}</span>
              </div>
            </div>
          </div>
          <div className={s.carbonDivider} />
          <div className={s.carbonFieldsRow}>
            <div>
              <span className={s.carbonFieldLabel}>Received From</span>
              <div className={s.carbonFieldValue}>
                {invoice.billTo.name}<br />
                {addrParts.map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}
                {!addrParts.length && <>&nbsp;</>}
              </div>
            </div>
          </div>
          <div className={s.carbonBottomRow}>
            <div className={s.carbonForBlock}>
              <span className={s.carbonFieldLabel}>For</span>
              <div className={s.carbonForValue}>{purpose}</div>
            </div>
            <div>
              <span className={s.carbonFieldLabel}>Received By</span>
              <div className={s.carbonForValue} style={{minWidth: 120}}>{receivedBy}</div>
            </div>
            <div className={s.carbonSigBlock}>
              {invoice.company.signatureUrl ? (
                <img src={invoice.company.signatureUrl} alt="Signature" className={s.signatureImg} style={{marginLeft: "auto"}} />
              ) : (
                <>
                  <div className={s.carbonSigLine} />
                  <div className={s.carbonSigLabel}>Authorised Signature</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
