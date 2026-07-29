"use client"

interface BusinessLetterViewProps {
  senderName: string
  senderCompany: string
  senderAddress: string
  recipientName: string
  recipientCompany: string
  recipientAddress: string
  letterDate: string
  subject: string
  letterBody: string
  signature: string
  companyLogo: string
}

export function BusinessLetterView(props: BusinessLetterViewProps) {
  return (
    <div className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full" style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}>
      {props.companyLogo && <div className="mb-8"><img src={props.companyLogo} alt="Logo" className="h-16 object-contain" /></div>}
      <div className="mb-8">
        <p className="font-semibold text-gray-900">{props.senderName || "Sender Name"}</p>
        <p className="text-gray-600">{props.senderCompany}</p>
        <p className="text-gray-600 whitespace-pre-wrap">{props.senderAddress}</p>
      </div>
      <div className="text-right mb-8"><p className="text-gray-600">{props.letterDate}</p></div>
      <div className="mb-8">
        <p className="font-semibold text-gray-900">{props.recipientName || "Recipient Name"}</p>
        <p className="text-gray-600">{props.recipientCompany}</p>
        <p className="text-gray-600 whitespace-pre-wrap">{props.recipientAddress}</p>
      </div>
      {props.subject && <div className="mb-6"><p className="font-bold text-gray-900">Subject: {props.subject}</p></div>}
      <div className="mb-12"><p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{props.letterBody || "Dear Sir/Madam,\n\n[Letter content...]\n\nSincerely,"}</p></div>
      <div className="mt-16">
        <p className="font-semibold text-gray-900">{props.senderName || "Sender Name"}</p>
        <p className="text-gray-600">{props.signature}</p>
      </div>
    </div>
  )
}
