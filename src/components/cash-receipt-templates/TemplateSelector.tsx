"use client"

import { useState } from "react"
import { TEMPLATES } from "./index"
import type { CashReceiptTemplateId } from "./index"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  selected: CashReceiptTemplateId
  onSelect: (id: CashReceiptTemplateId) => void
  minimal?: boolean
}

const previewSvgs: Record<CashReceiptTemplateId, string> = {
  VelvetReceipt: `<svg viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="140" rx="6" fill="#0D1B3E"/><rect x="3" y="10" width="4" height="120" rx="2" fill="url(#vg)"/><defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#C9A84C"/><stop offset=".5" stop-color="#E8C97A"/><stop offset="1" stop-color="#C9A84C"/></linearGradient></defs><text x="16" y="33" font-family="serif" font-size="10" font-weight="900" fill="#E8C97A">CASH RECEIPT</text><text x="16" y="44" font-family="sans-serif" font-size="5" fill="rgba(255,255,255,0.4)">COMPANY NAME</text><text x="16" y="64" font-family="sans-serif" font-size="4" fill="#C9A84C">RECEIVED FROM</text><text x="16" y="72" font-family="sans-serif" font-size="6" fill="rgba(255,255,255,0.85)">Payer Name</text><text x="16" y="80" font-family="sans-serif" font-size="5" fill="rgba(255,255,255,0.6)">Address line</text><rect x="16" y="95" width="100" height="1" rx="0.5" fill="rgba(201,168,76,0.35)"/><text x="16" y="105" font-family="sans-serif" font-size="4" fill="#C9A84C">FOR</text><text x="16" y="113" font-family="sans-serif" font-size="5" fill="rgba(255,255,255,0.85)">Purpose</text><line x1="170" y1="20" x2="170" y2="120" stroke="rgba(201,168,76,0.18)"/><text x="178" y="33" font-family="sans-serif" font-size="3.5" fill="rgba(201,168,76,0.7)">RECEIPT NO.</text><text x="178" y="41" font-family="sans-serif" font-size="6" fill="rgba(255,255,255,0.9)">RCPT-001</text><text x="178" y="55" font-family="sans-serif" font-size="3.5" fill="rgba(201,168,76,0.7)">DATE</text><text x="178" y="63" font-family="sans-serif" font-size="6" fill="rgba(255,255,255,0.9)">26 Jun 2026</text><text x="178" y="85" font-family="sans-serif" font-size="3.5" fill="rgba(201,168,76,0.7)">AMOUNT</text><text x="178" y="98" font-family="serif" font-size="10" font-weight="700" fill="#E8C97A">&#x20B9;1,000</text></svg>`,

  SageReceipt: `<svg viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="140" rx="8" fill="#FAFAF7"/><rect x="1" y="1" width="298" height="138" rx="8" stroke="#E8EDE6" stroke-width="0.5"/><rect x="0" y="0" width="65" height="140" rx="8" fill="url(#sg)"/><defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3D7A5C"/><stop offset="1" stop-color="#5BA882"/></linearGradient></defs><text x="8" y="90" font-family="sans-serif" font-size="6" font-weight="700" fill="#fff">Saffron</text><text x="8" y="99" font-family="sans-serif" font-size="4" fill="rgba(255,255,255,0.65)">Design</text><text x="75" y="18" font-family="sans-serif" font-size="5" font-weight="600" fill="#3D7A5C" letter-spacing="2">CASH RECEIPT</text><text x="207" y="12" font-family="sans-serif" font-size="3" fill="#9BB59A">NO.</text><text x="207" y="20" font-family="sans-serif" font-size="5" font-weight="600" fill="#2A3D2F">RCPT-001</text><text x="250" y="12" font-family="sans-serif" font-size="3" fill="#9BB59A">DATE</text><text x="250" y="20" font-family="sans-serif" font-size="5" font-weight="600" fill="#2A3D2F">26/06/26</text><text x="250" y="30" font-family="sans-serif" font-size="3" fill="#9BB59A">AMOUNT</text><text x="240" y="40" font-family="sans-serif" font-size="7" font-weight="600" fill="#3D7A5C">&#x20B9;1,000</text><text x="75" y="50" font-family="sans-serif" font-size="3.5" fill="#9BB59A">RECEIVED FROM</text><text x="75" y="59" font-family="sans-serif" font-size="5" font-weight="500" fill="#2A3D2F">Payer Name</text><text x="75" y="75" font-family="sans-serif" font-size="3.5" fill="#9BB59A">FOR</text><rect x="75" y="87" width="70" height="1" rx="0.5" fill="#D4E4D8"/><text x="75" y="95" font-family="sans-serif" font-size="5" fill="#2A3D2F">Purpose</text><text x="235" y="100" font-family="sans-serif" font-size="3" fill="#9BB59A">Authorised Sig.</text><line x1="200" y1="92" x2="255" y2="92" stroke="#C5D9C8"/></svg>`,

  CarbonReceipt: `<svg viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="140" rx="5" fill="#111318"/><rect x="1" y="1" width="298" height="138" rx="5" stroke="rgba(0,224,192,0.15)"/><rect x="0" y="0" width="22" height="140" fill="#111318" stroke="rgba(0,224,192,0.12)"/><text x="7" y="22" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.5)" transform="rotate(180 11 70)">RECEIPT</text><text x="30" y="18" font-family="sans-serif" font-size="8" font-weight="700" fill="#fff">CASH</text><text x="65" y="18" font-family="sans-serif" font-size="8" font-weight="700" fill="#00E0C0">RECEIPT</text><text x="200" y="8" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.55)">NO.</text><text x="200" y="16" font-family="monospace" font-size="5" fill="rgba(255,255,255,0.85)">RCPT-001</text><text x="235" y="8" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.55)">DATE</text><text x="235" y="16" font-family="monospace" font-size="5" fill="rgba(255,255,255,0.85)">26/06</text><text x="265" y="8" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.55)">AMT</text><text x="258" y="18" font-family="monospace" font-size="6" fill="#00E0C0">&#x20B9;1k</text><rect x="30" y="24" width="240" height="1" fill="rgba(0,224,192,0.15)"/><text x="30" y="38" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.5)">RECEIVED FROM</text><text x="30" y="48" font-family="sans-serif" font-size="5" fill="rgba(255,255,255,0.75)">Payer Name</text><text x="30" y="56" font-family="sans-serif" font-size="4" fill="rgba(255,255,255,0.5)">Address</text><text x="30" y="75" font-family="monospace" font-size="3.5" fill="rgba(0,224,192,0.5)">FOR</text><rect x="30" y="83" width="80" height="1" fill="rgba(0,224,192,0.2)"/><text x="30" y="91" font-family="sans-serif" font-size="5" fill="rgba(255,255,255,0.75)">Purpose</text><text x="243" y="88" font-family="monospace" font-size="3" fill="rgba(0,224,192,0.45)">Auth. Sig.</text><line x1="223" y1="83" x2="270" y2="83" stroke="rgba(0,224,192,0.25)"/></svg>`,

  SaffronReceipt: `<svg viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="140" rx="6" fill="#FFFDF8"/><rect x="1" y="1" width="298" height="138" rx="6" stroke="#F5E8D0"/><rect x="0" y="0" width="300" height="3" rx="6" fill="url(#sf)"/><defs><linearGradient id="sf" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#D37814"/><stop offset=".4" stop-color="#F0A835"/><stop offset="1" stop-color="#D37814"/></linearGradient></defs><line x1="65" y1="10" x2="65" y2="130" stroke="#F5E8D0" stroke-width="2"/><text x="10" y="30" font-family="sans-serif" font-size="4" font-weight="700" fill="#D37814" letter-spacing="2">CASH RECEIPT</text><text x="10" y="42" font-family="sans-serif" font-size="6" font-weight="600" fill="#2C1A06">Saffron</text><text x="10" y="50" font-family="sans-serif" font-size="4" fill="#B08050">Design Studio</text><text x="195" y="14" font-family="sans-serif" font-size="3" font-weight="600" fill="#D37814">RECEIPT NO.</text><text x="195" y="22" font-family="sans-serif" font-size="5" font-weight="600" fill="#2C1A06" text-anchor="end">RCPT-001</text><text x="228" y="14" font-family="sans-serif" font-size="3" font-weight="600" fill="#D37814">DATE</text><text x="228" y="22" font-family="sans-serif" font-size="5" font-weight="600" fill="#2C1A06" text-anchor="end">26/06/26</text><text x="265" y="14" font-family="sans-serif" font-size="3" font-weight="600" fill="#D37814">AMOUNT</text><text x="265" y="26" font-family="sans-serif" font-size="7" font-weight="600" fill="#D37814" text-anchor="end">&#x20B9;1,000</text><rect x="75" y="32" width="215" height="1" fill="url(#sf)" opacity="0.3"/><text x="75" y="46" font-family="sans-serif" font-size="3.5" font-weight="700" fill="#D37814">RECEIVED FROM</text><text x="75" y="55" font-family="sans-serif" font-size="5" fill="#3A2510">Payer Name</text><text x="75" y="63" font-family="sans-serif" font-size="4" fill="#6A4520">Address line</text><text x="75" y="80" font-family="sans-serif" font-size="3.5" font-weight="700" fill="#D37814">FOR</text><rect x="75" y="90" width="80" height="1.5" rx="0.75" fill="#F0D8B0"/><text x="75" y="99" font-family="sans-serif" font-size="5" fill="#3A2510">Purpose</text><text x="250" y="99" font-family="sans-serif" font-size="3" fill="#D37814" opacity="0.7">Auth. Sig.</text><line x1="215" y1="90" x2="270" y2="90" stroke="#F0D8B0" stroke-width="1.5"/></svg>`,
}

export function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              selected === t.id
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm"
                : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TemplateSelectorDialog({
  selected,
  onSelect,
  onClose,
}: Props & { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-6 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-display font-semibold mb-1">Choose a Template</h3>
        <p className="text-xs text-muted-foreground mb-6">Select a design style for your cash receipt.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelect(t.id)
                onClose()
              }}
              className={`relative rounded-xl border-2 overflow-hidden transition-all text-left ${
                selected === t.id
                  ? "border-amber-500 ring-2 ring-amber-500/20 shadow-lg"
                  : "border-border hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <div className="bg-gray-50 dark:bg-gray-800 p-2 flex items-center justify-center min-h-[100px]">
                <img
                  src={`data:image/svg+xml,${encodeURIComponent(previewSvgs[t.id])}`}
                  alt={t.name}
                  className="w-full h-auto max-h-[120px] object-contain"
                />
              </div>
              <div className="p-3 border-t border-border">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
