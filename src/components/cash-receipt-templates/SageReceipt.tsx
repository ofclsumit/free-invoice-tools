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

export default function SageReceipt({ invoice, className = "" }: Props) {
  const { paymentMethod, purpose, receivedBy } = parseMeta(invoice)
  const address = invoice.billTo.addressLines?.join(", ") || ""
  const amount = invoice.amountPaid ?? invoice.items.reduce((s, i) => s + i.rate * i.quantity, 0)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  return (
    <div className={`${s.receipt} ${s.sage} ${className}`}>
      <div className={s.sageWatermark}>
        <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.watermarkSvg}>
          <circle cx="130" cy="130" r="120" stroke="#3D7A5C" strokeWidth="1"/>
          <circle cx="130" cy="130" r="95"  stroke="#3D7A5C" strokeWidth="1"/>
          <circle cx="130" cy="130" r="70"  stroke="#3D7A5C" strokeWidth="1"/>
          <circle cx="130" cy="130" r="45"  stroke="#3D7A5C" strokeWidth="1"/>
          <circle cx="130" cy="130" r="20"  fill="#3D7A5C" opacity="0.5"/>
          <line x1="10" y1="130" x2="250" y2="130" stroke="#3D7A5C" strokeWidth="0.8"/>
          <line x1="130" y1="10" x2="130" y2="250" stroke="#3D7A5C" strokeWidth="0.8"/>
          <line x1="45" y1="45" x2="215" y2="215" stroke="#3D7A5C" strokeWidth="0.5"/>
          <line x1="215" y1="45" x2="45" y2="215" stroke="#3D7A5C" strokeWidth="0.5"/>
        </svg>
      </div>
      <div className={s.sageLeftAccent}>
        <div className={s.sageCompanyBlock}>
          {invoice.company.logoUrl && (
            <img src={invoice.company.logoUrl} alt="Logo" className={s.logo} style={{marginBottom: 6}} />
          )}
          <div className={s.sageCompanyName}>{invoice.company.name}</div>
          <div className={s.sageCompanyTagline}>Payment Received</div>
        </div>
      </div>
      <div className={s.sageBody}>
        <div className={s.sageTopRow}>
          <div className={s.sageReceiptTitle}>Cash Receipt</div>
          <div className={s.sageMetaGrid}>
            <div>
              <span className={s.sageMetaLabel}>No.</span>
              <span className={s.sageMetaValue}>{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className={s.sageMetaLabel}>Date</span>
              <span className={s.sageMetaValue}>{invoice.invoiceDate}</span>
            </div>
            <div>
              <span className={s.sageMetaLabel}>Method</span>
              <span className={s.sageMetaValue}>{paymentMethod}</span>
            </div>
            <div>
              <span className={s.sageMetaLabel}>Amount</span>
              <span className={`${s.sageMetaValue} ${s.sageAmountValue}`}>{invoice.currencySymbol}{fmt(amount)}</span>
            </div>
          </div>
        </div>
        <div className={s.sageDivider} />
        <div className={s.sageMiddleRow}>
          <div>
            <span className={s.sageFieldLabel}>Received From</span>
            <div className={s.sageFieldValue}>
              {invoice.billTo.name}{address ? <>, {address}</> : null}
            </div>
          </div>
        </div>
        <div className={s.sageBottomRow}>
          <div className={s.sageForField}>
            <span className={s.sageFieldLabel}>For</span>
            <div className={s.sageForValue}>{purpose}</div>
          </div>
          <div>
            <span className={s.sageFieldLabel}>Received By</span>
            <div className={s.sageForValue} style={{minWidth: 120}}>{receivedBy}</div>
          </div>
          <div className={s.sageSigBlock}>
            {invoice.company.signatureUrl ? (
              <img src={invoice.company.signatureUrl} alt="Signature" className={s.signatureImg} style={{marginLeft: "auto"}} />
            ) : (
              <>
                <div className={s.sageSigLine} />
                <div className={s.sageSigLabel}>Authorised Signature</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
