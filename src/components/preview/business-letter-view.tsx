"use client"

import React from "react"

export interface BusinessLetterViewProps {
  companyLogo?: string
  senderName?: string
  senderTitle?: string
  senderCompany?: string
  senderAddress?: string
  senderPhone?: string
  senderEmail?: string

  recipientName?: string
  recipientTitle?: string
  recipientCompany?: string
  recipientAddress?: string
  recipientEmail?: string

  letterDate?: string
  referenceNo?: string
  subject?: string

  salutation?: string
  letterBody?: string
  valediction?: string

  signature?: string
  signatureImage?: string
  ccRecipients?: string
  enclosures?: string
}

export function BusinessLetterView(props: BusinessLetterViewProps) {
  return (
    <div
      className="bg-white text-[#111111] p-10 sm:p-14 print:shadow-none print:p-8 print:rounded-none w-full mx-auto"
      style={{
        maxWidth: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: "Times New Roman, Garamond, Georgia, serif",
        fontSize: "14.5px",
        lineHeight: "1.6",
      }}
    >
      {/* ── Letterhead / Sender Information ───────────────────────── */}
      <div className="border-b-2 border-[#111111] pb-6 mb-8 flex justify-between items-start gap-6 font-sans">
        <div className="space-y-1 max-w-[62%]">
          {props.companyLogo && (
            <img src={props.companyLogo} alt="Logo" className="h-16 max-w-[180px] object-contain mb-3" />
          )}
          <h2 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight">
            {props.senderCompany || props.senderName || "Organization"}
          </h2>
          {props.senderAddress && (
            <p className="text-[13px] text-[#444444] leading-normal whitespace-pre-line">
              {props.senderAddress}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 text-[12.5px] text-[#444444] pt-0.5">
            {props.senderPhone && <span><strong>Phone:</strong> {props.senderPhone}</span>}
            {props.senderEmail && <span><strong>Email:</strong> {props.senderEmail}</span>}
          </div>
        </div>

        <div className="text-right shrink-0 min-w-[160px] text-[13.5px] space-y-1">
          {props.referenceNo && (
            <p className="font-mono text-[12px] font-bold text-[#333333] tracking-wide">
              {props.referenceNo}
            </p>
          )}
          <p className="font-semibold text-[#111111] pt-1">
            {props.letterDate || new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
      </div>

      {/* ── Recipient Information ─────────────────────────────────── */}
      <div className="mb-8 font-sans text-[14px] space-y-0.5 max-w-[60%]">
        <p className="text-[#666666] text-[11px] uppercase tracking-wider font-bold mb-1">To,</p>
        <p className="font-bold text-[15px] text-[#111111]">{props.recipientName || "Recipient Name"}</p>
        {props.recipientTitle && <p className="text-[#444444] font-medium">{props.recipientTitle}</p>}
        {props.recipientCompany && <p className="text-[#222222] font-semibold">{props.recipientCompany}</p>}
        {props.recipientAddress && (
          <p className="text-[#444444] whitespace-pre-line leading-normal pt-0.5">{props.recipientAddress}</p>
        )}
        {props.recipientEmail && <p className="text-[#555555] text-[13px] pt-0.5">{props.recipientEmail}</p>}
      </div>

      {/* ── Formal Subject ────────────────────────────────────────── */}
      {props.subject && (
        <div className="mb-6 pb-2 border-b border-[#E0E0E0]">
          <p className="font-bold text-[15.5px] text-[#111111] leading-snug">
            <span className="uppercase tracking-wide mr-2 text-[13px] text-[#444444] font-sans">SUBJECT:</span>
            {props.subject}
          </p>
        </div>
      )}

      {/* ── Salutation & Letter Body ──────────────────────────────── */}
      <div className="space-y-4 leading-relaxed text-[#1a1a1a]">
        {props.salutation && (
          <p className="font-semibold text-[15px] text-[#111111]">{props.salutation}</p>
        )}
        <div className="whitespace-pre-line text-[15px] leading-[1.7] text-justify space-y-3">
          {props.letterBody || "Dear Sir/Madam,\n\n[Letter content...]\n\nSincerely,"}
        </div>
      </div>

      {/* ── Valediction & Signatory ──────────────────────────────── */}
      <div className="mt-10 pt-4 max-w-[280px]">
        <p className="text-[14.5px] font-medium text-[#222222] mb-3">
          {props.valediction || "Sincerely,"}
        </p>

        {props.signatureImage ? (
          <img src={props.signatureImage} alt="Signature" className="h-12 max-w-[160px] object-contain my-2" />
        ) : (
          <div className="h-10" />
        )}

        <div className="border-t border-[#111111] pt-1.5 font-sans">
          <p className="font-bold text-[14.5px] text-[#111111]">{props.senderName || "Signatory Name"}</p>
          {(props.signature || props.senderTitle) && (
            <p className="text-[13px] text-[#555555] font-medium">
              {props.signature || props.senderTitle}
            </p>
          )}
          {props.senderCompany && (
            <p className="text-[12px] text-[#666666]">{props.senderCompany}</p>
          )}
        </div>
      </div>

      {/* ── Carbon Copy & Enclosures ─────────────────────────────── */}
      {(props.ccRecipients || props.enclosures) && (
        <div className="mt-12 pt-4 border-t border-[#EAEAEA] font-sans text-[12.5px] space-y-1.5 text-[#555555]">
          {props.ccRecipients && (
            <p><strong className="text-[#333333]">CC:</strong> {props.ccRecipients}</p>
          )}
          {props.enclosures && (
            <p><strong className="text-[#333333]">Enclosures:</strong> {props.enclosures}</p>
          )}
        </div>
      )}
    </div>
  )
}
