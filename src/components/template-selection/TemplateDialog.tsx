import React, { useState, useEffect, useRef } from "react";
import { TemplateDialogProps, Template } from "./types";
import TemplateCard from "./TemplateCard";

const CATEGORIES = ["Modern", "Corporate", "Minimal", "Creative", "GST India"] as const;
type Category = (typeof CATEGORIES)[number];

const PRESET_TEMPLATES: (Template & { category: Category })[] = [
  {
    id: "modern",
    name: "Modern Studio",
    category: "Modern",
    description: "Gradient accents, rounded cards, and clean modern spacing.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
        <div className="flex justify-between items-center border-b pb-1 border-stone-100">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-indigo-600" />
            <span className="font-extrabold text-stone-800 scale-75 origin-left">ACME INC</span>
          </div>
          <div className="w-6 h-2 rounded bg-indigo-50" />
        </div>
        <div className="grid grid-cols-3 gap-1 my-1">
          <div className="h-4 rounded bg-stone-50 border border-stone-100 p-0.5 space-y-0.5">
            <div className="w-4 h-0.5 bg-indigo-200" />
            <div className="w-3 h-0.5 bg-stone-200" />
          </div>
          <div className="col-span-2 h-4 rounded bg-stone-50 border border-stone-100 p-0.5 space-y-0.5">
            <div className="w-5 h-0.5 bg-indigo-200" />
            <div className="w-4 h-0.5 bg-stone-200" />
          </div>
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex justify-between text-stone-400 font-bold border-b pb-0.5 border-stone-150">
            <span>ITEM</span>
            <span>QTY</span>
            <span>TOTAL</span>
          </div>
          <div className="flex justify-between border-b pb-0.5 border-stone-100">
            <span className="w-12 bg-stone-100 h-0.5 rounded" />
            <span className="w-2 bg-stone-100 h-0.5 rounded" />
            <span className="w-4 bg-stone-200 h-0.5 rounded" />
          </div>
          <div className="flex justify-between">
            <span className="w-8 bg-stone-100 h-0.5 rounded" />
            <span className="w-2 bg-stone-100 h-0.5 rounded" />
            <span className="w-4 bg-stone-200 h-0.5 rounded" />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <div className="w-12 space-y-0.5">
            <div className="flex justify-between"><div className="w-4 bg-stone-100 h-0.5" /><div className="w-4 bg-stone-100 h-0.5" /></div>
            <div className="flex justify-between pt-0.5 border-t border-indigo-200"><div className="w-5 bg-indigo-600 h-1" /><div className="w-5 bg-indigo-600 h-1" /></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "modern-wave",
    name: "Modern Wave",
    category: "Modern",
    description: "Elegant layout with dark charcoal wave decorations at the bottom.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white text-[4px] leading-tight select-none relative">
        <div>
          <div className="flex justify-between items-center border-b pb-1 border-stone-100 mb-1">
            <span className="font-bold scale-75 origin-left">WAVE INC</span>
            <span className="font-mono text-stone-400">NO. 0001</span>
          </div>
          <span className="font-black text-[9px] block mb-0.5 leading-none">INVOICE</span>
          <span className="text-[3px] text-stone-400 block mb-2">Date: 02 June, 2030</span>
          <div className="grid grid-cols-2 gap-2 my-1 border-b pb-2 border-stone-100">
            <div className="space-y-0.5">
              <span className="text-stone-400 block font-bold">Billed to:</span>
              <span className="font-bold block">Studio Shodwe</span>
              <span className="text-stone-400 block">123 Anywhere St.</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-stone-400 block font-bold">From:</span>
              <span className="font-bold block">Olivia Wilson</span>
              <span className="text-stone-400 block">123 Anywhere St.</span>
            </div>
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex justify-between font-bold border-b pb-0.5 border-stone-100 text-stone-600">
              <span>ITEM</span>
              <span>QTY</span>
              <span>TOTAL</span>
            </div>
            <div className="flex justify-between text-stone-400 border-b pb-0.5 border-stone-50">
              <span>Logo Design</span>
              <span>1</span>
              <span>$500</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
            <path d="M 0 10 Q 30 5, 60 15 T 100 12 L 100 20 L 0 20 Z" fill="#e2e8f0" />
            <path d="M 0 15 Q 30 17, 60 13 T 100 9 L 100 20 L 0 20 Z" fill="#1e293b" />
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "corporate",
    name: "Corporate Ledger",
    category: "Corporate",
    description: "Structured navy banners, double-border details, formal layout.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
        <div className="bg-blue-900 text-white p-1 rounded-t -mx-1 -mt-1 flex justify-between items-center">
          <span className="font-extrabold scale-75 origin-left">OFFICIAL CORP</span>
          <span className="font-light scale-50 origin-right">INVOICE</span>
        </div>
        <div className="grid grid-cols-2 gap-1 my-1.5">
          <div className="space-y-0.5">
            <div className="w-6 h-0.5 bg-stone-300" />
            <div className="w-8 h-0.5 bg-stone-200" />
          </div>
          <div className="space-y-0.5 text-right flex flex-col items-end">
            <div className="w-8 h-1 bg-blue-100 rounded" />
            <div className="w-6 h-0.5 bg-stone-200" />
          </div>
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex justify-between bg-blue-900/10 p-0.5 text-blue-900 font-bold">
            <span>ITEM</span>
            <span>QTY</span>
            <span>TOTAL</span>
          </div>
          <div className="flex justify-between border-b pb-0.5 border-stone-100">
            <span className="w-10 bg-stone-150 h-0.5 rounded" />
            <span className="w-2 bg-stone-150 h-0.5 rounded" />
            <span className="w-4 bg-stone-200 h-0.5 rounded" />
          </div>
          <div className="flex justify-between">
            <span className="w-6 bg-stone-150 h-0.5 rounded" />
            <span className="w-2 bg-stone-150 h-0.5 rounded" />
            <span className="w-4 bg-stone-200 h-0.5 rounded" />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <div className="w-10 space-y-0.5">
            <div className="flex justify-between"><div className="w-4 bg-stone-100 h-0.5" /><div className="w-4 bg-stone-100 h-0.5" /></div>
            <div className="flex justify-between bg-blue-900 p-0.5 text-white font-bold"><div className="w-4 bg-white/20 h-0.5" /><div className="w-4 bg-white/20 h-0.5" /></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "elite-red",
    name: "Elite Red",
    category: "Corporate",
    description: "Crimson header layout with top diagonal polygon geometry.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white text-[4px] leading-tight select-none relative">
        <div className="absolute top-0 right-0 w-12 h-6 pointer-events-none">
          <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
            <polygon points="0,0 100,0 100,50" fill="#991b1b" />
            <polygon points="40,0 100,0 100,30" fill="#1e293b" />
          </svg>
        </div>
        <div>
          <div className="mb-2">
            <span className="font-bold text-stone-500 block">INGOUDECOMPANY</span>
            <span className="font-black text-xs text-[#991b1b] block">INVOICE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1 border-b pb-1 border-stone-100">
            <div>
              <span className="text-[#991b1b] font-bold block">Bill To:</span>
              <span className="font-bold block">Rosa Maria</span>
            </div>
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex justify-between bg-[#991b1b] text-white p-0.5 font-bold">
              <span>Description</span>
              <span>Qty</span>
              <span>Total</span>
            </div>
            <div className="flex justify-between text-slate-600 border-b border-stone-50 pb-0.5">
              <span>Consulting</span>
              <span>1</span>
              <span>$100.00</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div className="text-[3px] text-stone-400">
            <span className="font-bold block">Payment:</span>
            <span>Name Bank</span>
          </div>
          <span className="font-serif italic text-[6px] text-slate-800">Thank You!</span>
        </div>
      </div>
    )
  },
  {
    id: "minimal",
    name: "Minimalist",
    category: "Minimal",
    description: "Sleek monochrome design with high-contrast typewriter spacing.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white border border-stone-200 rounded text-[4px] leading-tight select-none">
        <div className="border-b border-stone-200 pb-1 flex justify-between">
          <span className="font-mono font-bold text-stone-900">M N M L</span>
          <span className="font-mono text-stone-400">#0041</span>
        </div>
        <div className="my-1.5 space-y-0.5">
          <div className="w-12 h-0.5 bg-stone-900" />
          <div className="w-8 h-0.5 bg-stone-400" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between border-b border-stone-950 pb-0.5 text-stone-900 font-mono font-bold">
            <span>DESC</span>
            <span>TOTAL</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-0.5 font-mono">
            <span>development</span>
            <span>$120.00</span>
          </div>
        </div>
        <div className="flex justify-end border-t border-stone-950 pt-1">
          <div className="w-10 flex justify-between font-mono font-bold">
            <span>TOTAL</span>
            <span>$120.00</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    name: "Freelancer Classic",
    category: "Creative",
    description: "Asymmetrical blocks, warm amber gradients, modern aesthetics.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
        <div className="flex justify-between items-start bg-rose-50 p-1 rounded">
          <div>
            <div className="w-12 h-1 bg-rose-500 rounded" />
            <div className="w-8 h-0.5 bg-rose-300 mt-0.5" />
          </div>
          <div className="w-8 h-2 rounded bg-amber-100" />
        </div>
        <div className="grid grid-cols-3 gap-1 my-1">
          <div className="col-span-1 bg-amber-50/50 p-0.5 rounded border border-amber-100/50 space-y-0.5">
            <div className="w-6 h-0.5 bg-stone-300" />
            <div className="w-4 h-0.5 bg-stone-200" />
          </div>
          <div className="col-span-2 bg-stone-50 p-0.5 rounded space-y-0.5">
            <div className="w-8 h-0.5 bg-stone-300" />
            <div className="w-10 h-0.5 bg-stone-200" />
          </div>
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="flex justify-between bg-rose-500 text-white p-0.5 rounded">
            <span>ITEM</span>
            <span>TOTAL</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-0.5">
            <span className="w-10 bg-stone-100 h-0.5" />
            <span className="w-4 bg-stone-200 h-0.5" />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <div className="w-10 bg-rose-500 text-white p-0.5 rounded flex justify-between font-bold">
            <span>SUM</span>
            <span>$95</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "garage-brand",
    name: "Garage Brand",
    category: "Creative",
    description: "Bold dark navy and red theme with a prominent red brand mark box.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-[#f8f9fa] text-[4.5px] leading-tight select-none relative">
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-red-500 rounded-tr-lg flex items-center justify-center">
          <span className="text-white font-black text-[10px]">R</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-2">
            <div className="w-3 h-3 bg-red-500 flex items-center justify-center text-white font-bold text-[6px] rounded-sm">R</div>
            <span className="font-extrabold text-[5px] tracking-wider">RIMBERIO</span>
          </div>
          <span className="font-extrabold text-lg block text-slate-900 leading-none">invoice</span>
          <span className="text-[3px] text-stone-400 block mb-2 mt-0.5">Invoice Number: 01234</span>
          <div className="my-1.5 space-y-0.5">
            <span className="text-stone-400 block font-bold">Billed to:</span>
            <span className="font-bold block">Connor Hamilton</span>
          </div>
          <div className="flex-grow space-y-1 mt-2 border-t border-b border-slate-200 py-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>ITEM DESCRIPTION</span>
              <span>QTY</span>
              <span>TOTAL</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Oil Change</span>
              <span>1</span>
              <span>$40.00</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end text-right">
          <div>
            <span className="font-bold block">TOTAL: $400.00</span>
            <span className="text-[3px] text-stone-400 block mt-1">Fauget Bank</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "gst-india",
    name: "GST India",
    category: "GST India",
    description: "Optimized for Indian tax auditing with structured SGST/CGST split panels.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white border border-amber-700 rounded text-[4px] leading-tight select-none">
        <div className="bg-amber-50 p-1 border-b border-amber-700 flex justify-between items-center -mx-1 -mt-1">
          <span className="font-extrabold text-amber-900 scale-75 origin-left">GST INVOICE</span>
          <span className="text-[3px] text-amber-700 font-mono">GSTIN: 07AAAAA1111A1Z1</span>
        </div>
        <div className="grid grid-cols-2 gap-1 my-1 border border-stone-200 p-0.5">
          <div>
            <div className="w-8 h-0.5 bg-stone-400" />
            <div className="w-12 h-0.5 bg-stone-300" />
          </div>
          <div>
            <div className="w-8 h-0.5 bg-stone-400" />
            <div className="w-12 h-0.5 bg-stone-300" />
          </div>
        </div>
        <div className="flex-1 space-y-0.5 border border-stone-200 rounded-sm">
          <div className="flex justify-between bg-stone-50 border-b border-stone-200 p-0.5 text-stone-700 font-bold">
            <span>DESC</span>
            <span>CGST</span>
            <span>SGST</span>
            <span>TOTAL</span>
          </div>
          <div className="flex justify-between px-0.5">
            <span className="w-8 bg-stone-100 h-0.5" />
            <span className="w-2 bg-stone-100 h-0.5" />
            <span className="w-2 bg-stone-100 h-0.5" />
            <span className="w-4 bg-stone-200 h-0.5 font-bold" />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <div className="w-12 bg-amber-700 text-white p-0.5 rounded-sm flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₹45,000</span>
          </div>
        </div>
      </div>
    ),
  },
];

const SUPPORTED_DOC_TYPES = [
  "invoice",
  "quotation",
  "proforma invoice",
  "purchase order",
  "delivery challan",
];

const formValueToId: Record<string, string> = {
  StudioTemplate: "modern",
  LedgerTemplate: "corporate",
  MinimalMonoTemplate: "minimal",
  ClassicBooksTemplate: "creative",
  VyaparDesiTemplate: "gst-india",
  ModernWaveTemplate: "modern-wave",
  GarageBrandTemplate: "garage-brand",
  EliteRedTemplate: "elite-red",
};

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  documentType = "invoice",
  currentValue = "StudioTemplate",
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>("Modern");
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-switch active tab to the category of the currently selected template on load
  useEffect(() => {
    if (isOpen && currentValue) {
      const activeId = formValueToId[currentValue];
      const match = PRESET_TEMPLATES.find((t) => t.id === activeId);
      if (match) {
        setActiveCategory(match.category);
      }
    }
  }, [isOpen, currentValue]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSupportedType = SUPPORTED_DOC_TYPES.includes(documentType.toLowerCase());
  const displayedTemplates = isSupportedType
    ? PRESET_TEMPLATES.filter((t) => t.category === activeCategory)
    : [];

  const currentTemplateId = currentValue ? formValueToId[currentValue] : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 dark:bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[960px] max-h-[80vh] flex flex-col bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-850 overflow-hidden transform transition-all duration-300 scale-100 animate-slide-up focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 pt-5 pb-4 border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                Select Template
              </h2>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                Click any layout card below to instantly apply it to your {documentType || "document"}.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1 bg-stone-100 dark:bg-stone-950 rounded-xl max-w-lg border border-stone-200/40 dark:border-stone-850">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-white dark:bg-stone-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-stone-200/30"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Template Cards Grid - Simplified and highly optimized */}
        <div className="flex-grow overflow-y-auto p-6 bg-stone-50/50 dark:bg-stone-950/20">
          {displayedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={currentTemplateId === template.id}
                  onSelect={() => {
                    onSelect(template.id); // Send short category key directly to trigger the mappings!
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-16 text-center">
              <svg className="h-10 w-10 text-stone-300 dark:text-stone-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                Unavailable Layout
              </h3>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 max-w-sm">
                Document type "{documentType}" does not support custom layouts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDialog;
