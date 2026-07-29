"use client"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

interface RentReceiptViewProps {
  tenantName: string
  landlordName: string
  landlordPan: string
  propertyAddress: string
  monthlyRent: string
  startDate: string
  endDate: string
  paymentDate: string
}

function getMonthLabel(startDate: string) {
  if (startDate) {
    const d = new Date(startDate)
    return MONTHS[d.getMonth()] + " " + d.getFullYear()
  }
  return "(Month)"
}

function getPeriod(startDate: string, endDate: string) {
  if (!startDate && !endDate) return "______"
  const s = startDate ? new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "______"
  const e = endDate ? new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "______"
  return `${s} to ${e}`
}

export function RentReceiptView(props: RentReceiptViewProps) {
  const numRent = parseFloat(props.monthlyRent) || 0

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", width: "100%", maxWidth: "750px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ background: "#fff", border: "2.5px solid #3aaa35", borderRadius: "4px", padding: "28px 32px 20px 32px", position: "relative", overflow: "hidden", minHeight: "260px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 60'%3E%3Cpolygon points='40,5 75,30 5,30' fill='%23d6f0d4' /%3E%3Crect x='10' y='30' width='60' height='25' fill='%23d6f0d4'/%3E%3Crect x='30' y='38' width='20' height='17' fill='%23b8e4b5'/%3E%3Crect x='15' y='33' width='14' height='12' fill='%23b8e4b5'/%3E%3Crect x='51' y='33' width='14' height='12' fill='%23b8e4b5'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 48'%3E%3Cpolygon points='30,4 56,22 4,22' fill='%23d6f0d4' /%3E%3Crect x='7' y='22' width='46' height='22' fill='%23d6f0d4'/%3E%3Crect x='21' y='30' width='18' height='14' fill='%23b8e4b5'/%3E%3Crect x='11' y='25' width='10' height='9' fill='%23b8e4b5'/%3E%3Crect x='39' y='25' width='10' height='9' fill='%23b8e4b5'/%3E%3C/svg%3E")`, backgroundSize: "170px 120px, 110px 80px", backgroundPosition: "center 60%, center 40%", backgroundRepeat: "no-repeat, no-repeat" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "26px", marginBottom: "20px", lineHeight: 1 }}>
            <span style={{ color: "#3aaa35", fontWeight: 700 }}>RENT RECEIPT</span>
            <span style={{ color: "#222", fontWeight: 400 }}> ({getMonthLabel(props.startDate)})</span>
          </h1>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                Received a sum of Rs.<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "90px", fontWeight: props.monthlyRent ? 700 : 400 }}>&nbsp;{props.monthlyRent ? `₹${numRent.toLocaleString("en-IN")}` : " "}&nbsp;</span>
                &nbsp;from Mr/Mrs <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "160px", fontWeight: props.tenantName ? 700 : 400 }}>&nbsp;{props.tenantName || " "}&nbsp;</span>
                &nbsp;towards the rent of property situated
              </div>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                At (Address) <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "280px", fontWeight: props.propertyAddress ? 700 : 400 }}>&nbsp;{props.propertyAddress || " "}&nbsp;</span>
              </div>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                For the period <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "200px", fontWeight: (props.startDate || props.endDate) ? 700 : 400 }}>&nbsp;{getPeriod(props.startDate, props.endDate)}&nbsp;</span>
              </div>
            </div>
            <div style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", paddingTop: "4px" }}>
              <div style={{ width: "80px", height: "80px", border: "1.5px dashed #aaa", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "10px", color: "#aaa", marginBottom: "10px", alignSelf: "flex-end" }}>
                Revenue<br />Stamp
              </div>
              <div style={{ fontSize: "13.5px", color: "#222", lineHeight: 2.2 }}>
                <div style={{ fontWeight: 600 }}>Signature (landlord)</div>
                <div>Name <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "120px", fontWeight: props.landlordName ? 700 : 400 }}>&nbsp;{props.landlordName || " "}&nbsp;</span></div>
                <div>PAN &nbsp;&nbsp;<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "120px", fontWeight: props.landlordPan ? 700 : 400 }}>&nbsp;{props.landlordPan || " "}&nbsp;</span></div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "18px", fontSize: "14px", color: "#222" }}>
            Date:<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "90px", fontWeight: 700 }}>&nbsp;{props.paymentDate}&nbsp;</span>
          </div>
          <div style={{ marginTop: "14px", fontSize: "11px", color: "#666", fontStyle: "italic" }}>
            Receipt Generated by QuickInvoice on <a href="https://quickinvoicepro.vercel.app" target="_blank" style={{ color: "#3aaa35", textDecoration: "none" }} rel="noreferrer">quickinvoicepro.vercel.app</a>
          </div>
        </div>
      </div>
    </div>
  )
}
