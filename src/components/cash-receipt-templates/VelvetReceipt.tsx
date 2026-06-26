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

export default function VelvetReceipt({ invoice, className = "" }: Props) {
  const { paymentMethod, purpose, receivedBy } = parseMeta(invoice)
  const address = invoice.billTo.addressLines?.join(", ") || ""
  const amount = invoice.amountPaid ?? invoice.items.reduce((s, i) => s + i.rate * i.quantity, 0)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  return (
    <div className={`${s.receipt} ${s.velvet} ${className}`}>
      <div className={s.velvetWatermark}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.watermarkSvg}>
          <g opacity="0.25" stroke="#C9A84C" strokeWidth="0.6">
            <line x1="0" y1="150" x2="300" y2="150"/>
            <line x1="150" y1="0" x2="150" y2="300"/>
            <line x1="0" y1="0" x2="300" y2="300"/>
            <line x1="300" y1="0" x2="0" y2="300"/>
            <rect x="75" y="75" width="150" height="150" transform="rotate(45 150 150)"/>
            <rect x="55" y="55" width="190" height="190" transform="rotate(45 150 150)"/>
            <rect x="35" y="35" width="230" height="230" transform="rotate(45 150 150)"/>
            <rect x="110" y="110" width="80" height="80" transform="rotate(45 150 150)"/>
            <rect x="130" y="130" width="40" height="40" transform="rotate(45 150 150)"/>
          </g>
          <circle cx="150" cy="150" r="8" fill="#C9A84C" opacity="0.4"/>
          <circle cx="150" cy="150" r="4" fill="#C9A84C" opacity="0.6"/>
        </svg>
      </div>
      <div className={s.velvetLeftStripe} />
      <div className={s.velvetBody}>
        <div className={s.velvetColLeft}>
          <div className={s.velvetTitleRow}>
            <div className={s.velvetReceiptTitle}>Cash Receipt</div>
            <div className={s.velvetCompanyName}>{invoice.company.name}</div>
          </div>
          <div className={s.velvetReceivedFrom}>
            <div className={s.velvetSectionLabel}>Received From</div>
            <div className={s.velvetSectionValue}>
              {invoice.billTo.name}<br />
              {address || "\u00A0"}
            </div>
          </div>
          <div className={s.velvetBottomFields}>
            <div>
              <div className={s.velvetSectionLabel}>For</div>
              <div className={s.velvetFieldValue}>{purpose}</div>
            </div>
            <div>
              <div className={s.velvetSectionLabel}>Received By</div>
              <div className={s.velvetFieldValue}>{receivedBy}</div>
            </div>
          </div>
        </div>
        <div className={s.velvetColRight}>
          <div>
            <div className={s.velvetMetaLabel}>Receipt No.</div>
            <div className={s.velvetMetaValue}>{invoice.invoiceNumber}</div>
          </div>
          <div>
            <div className={s.velvetMetaLabel}>Date</div>
            <div className={s.velvetMetaValue}>{invoice.invoiceDate}</div>
          </div>
          <div>
            <div className={s.velvetMetaLabel}>Payment Method</div>
            <div className={s.velvetMetaValue}>{paymentMethod}</div>
          </div>
          <div className={s.velvetMetaAmount}>
            <div className={s.velvetMetaLabel}>Amount</div>
            <div className={s.velvetMetaValue}>{invoice.currencySymbol}{fmt(amount)}</div>
          </div>
        </div>
        <div className={s.velvetSigArea}>
          <div className={s.velvetSigLine}>
            <div className={s.velvetSigLabel}>Signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}
