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

export default function SaffronReceipt({ invoice, className = "" }: Props) {
  const { paymentMethod, purpose, receivedBy } = parseMeta(invoice)
  const address = invoice.billTo.addressLines?.join(", ") || ""
  const amount = invoice.amountPaid ?? invoice.items.reduce((s, i) => s + i.rate * i.quantity, 0)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  return (
    <div className={`${s.receipt} ${s.saffron} ${className}`}>
      <div className={s.saffronWatermark}>
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.watermarkSvg}>
          <g stroke="#D37814" strokeWidth="1">
            <circle cx="140" cy="140" r="130"/>
            <circle cx="140" cy="140" r="110"/>
            <circle cx="140" cy="140" r="88"/>
            <circle cx="140" cy="140" r="66"/>
            <circle cx="140" cy="140" r="44"/>
            <circle cx="140" cy="140" r="22"/>
            <line x1="140" y1="10" x2="140" y2="270"/>
            <line x1="10" y1="140" x2="270" y2="140"/>
            <line x1="48" y1="48" x2="232" y2="232"/>
            <line x1="232" y1="48" x2="48" y2="232"/>
            <ellipse cx="140" cy="80" rx="8" ry="18" fill="#D37814" opacity="0.3"/>
            <ellipse cx="140" cy="200" rx="8" ry="18" fill="#D37814" opacity="0.3"/>
            <ellipse cx="80" cy="140" rx="18" ry="8" fill="#D37814" opacity="0.3"/>
            <ellipse cx="200" cy="140" rx="18" ry="8" fill="#D37814" opacity="0.3"/>
            <ellipse cx="99" cy="99" rx="8" ry="18" transform="rotate(45 99 99)" fill="#D37814" opacity="0.2"/>
            <ellipse cx="181" cy="99" rx="8" ry="18" transform="rotate(-45 181 99)" fill="#D37814" opacity="0.2"/>
            <ellipse cx="99" cy="181" rx="8" ry="18" transform="rotate(-45 99 181)" fill="#D37814" opacity="0.2"/>
            <ellipse cx="181" cy="181" rx="8" ry="18" transform="rotate(45 181 181)" fill="#D37814" opacity="0.2"/>
          </g>
          <circle cx="140" cy="140" r="10" fill="#D37814" opacity="0.4"/>
        </svg>
      </div>
      <div className={s.saffronTopBar} />
      <div className={s.saffronBottomBar} />
      <div className={s.saffronContent}>
        <div className={s.saffronLeftBand}>
          <div className={s.saffronReceiptTitle}>Cash Receipt</div>
          {invoice.company.logoUrl && (
            <img src={invoice.company.logoUrl} alt="Logo" className={s.logo} style={{marginBottom: 6}} />
          )}
          <div className={s.saffronCompanyName}>{invoice.company.name}</div>
          <div className={s.saffronCompanySub}>Payment Received</div>
          <div className={s.saffronOrnament}>
            <div className={s.saffronOrnamentDot} />
            <div className={`${s.saffronOrnamentDot} ${s.saffronOrnamentMid}`} />
            <div className={s.saffronOrnamentDot} />
          </div>
        </div>
        <div className={s.saffronBody}>
          <div className={s.saffronTopMeta}>
            <div>
              <span className={s.saffronMetaLabel}>Receipt No.</span>
              <div className={s.saffronMetaValue}>{invoice.invoiceNumber}</div>
            </div>
            <div>
              <span className={s.saffronMetaLabel}>Date</span>
              <div className={s.saffronMetaValue}>{invoice.invoiceDate}</div>
            </div>
            <div>
              <span className={s.saffronMetaLabel}>Payment Method</span>
              <div className={s.saffronMetaValue}>{paymentMethod}</div>
            </div>
            <div>
              <span className={s.saffronMetaLabel}>Amount</span>
              <div className={`${s.saffronMetaValue} ${s.saffronAmountValue}`}>{invoice.currencySymbol}{fmt(amount)}</div>
            </div>
          </div>
          <div className={s.saffronDivider} />
          <div>
            <span className={s.saffronFieldLabel}>Received From</span>
            <div className={s.saffronFieldValue}>
              {invoice.billTo.name}{address ? ` \u00B7 ${address}` : ""}
            </div>
          </div>
          <div className={s.saffronBottomRow}>
            <div className={s.saffronForBlock}>
              <span className={s.saffronFieldLabel}>For</span>
              <div className={s.saffronForValue}>{purpose}</div>
            </div>
            <div style={{flexShrink: 0}}>
              <span className={s.saffronFieldLabel}>Received By</span>
              <div className={s.saffronForValue} style={{minWidth: 110}}>{receivedBy}</div>
            </div>
            <div className={s.saffronSigBlock}>
              {invoice.company.signatureUrl ? (
                <img src={invoice.company.signatureUrl} alt="Signature" className={s.signatureImg} style={{marginLeft: "auto"}} />
              ) : (
                <>
                  <div className={s.saffronSigLine} />
                  <div className={s.saffronSigLabel}>Authorised Signature</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
