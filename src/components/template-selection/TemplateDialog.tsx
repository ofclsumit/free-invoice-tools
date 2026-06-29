import React, { useState, useEffect, useRef } from "react";
import { TemplateDialogProps, Template } from "./types";
import TemplateCard from "./TemplateCard";

// Beautiful mini A4 representations of templates using pure HTML/CSS
const PRESET_TEMPLATES: Template[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Gradient accents, rounded cards, and clean modern spacing.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-1 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
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
    id: "corporate",
    name: "Corporate",
    description: "Structured navy banners, double-border details, formal layout.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-1 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
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
    id: "minimal",
    name: "Minimal",
    description: "Sleek monochrome design with high-contrast typewriter spacing.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-1.5 bg-white border border-stone-200 rounded text-[4px] leading-tight select-none">
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
    name: "Creative",
    description: "Asymmetrical blocks, warm amber gradients, modern aesthetics.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-1 bg-white rounded shadow-inner text-[4px] leading-tight select-none">
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
    id: "gst-india",
    name: "GST India",
    description: "Optimized for Indian tax auditing with structured SGST/CGST split panels.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-1 bg-white border border-amber-700 rounded text-[4px] leading-tight select-none">
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

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  documentType = "invoice",
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Focus modal wrapper for accessible keyboard navigation
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

  // Verify if document type is supported
  const isSupportedType = SUPPORTED_DOC_TYPES.includes(documentType.toLowerCase());
  const displayedTemplates = isSupportedType ? PRESET_TEMPLATES : [];

  const handleUseTemplate = () => {
    if (selectedTemplateId) {
      onSelect(selectedTemplateId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 dark:bg-stone-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[1200px] max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-250 dark:border-stone-850 overflow-hidden transform transition-all duration-300 scale-100 animate-slide-up focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
              Choose a Template
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Select a professional template for your {documentType || "document"}.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Template Grid Body */}
        <div className="flex-grow overflow-y-auto p-6">
          {displayedTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                Unavailable Document Type
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-sm">
                The document type "{documentType}" does not support custom layouts.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-stone-250 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTemplateId}
            onClick={handleUseTemplate}
            className={`px-5 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-all ${
              selectedTemplateId
                ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                : "bg-indigo-400/50 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed"
            }`}
          >
            Use Template
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TemplateDialog;
