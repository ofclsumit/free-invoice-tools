import React, { useState, useEffect, useRef, useMemo } from "react";
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
    id: "red-modern",
    name: "Red Modern Company",
    category: "Modern",
    description: "Bold navy and red theme with prominent brand badge and decorative monogram.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-[#e9e7e4] text-[4px] leading-tight select-none relative">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-[#12121b] flex items-center justify-center text-white font-black text-[6px] rounded-sm">T</div>
          <div><div className="font-black text-[5px]">TURNIVO</div><div className="text-[2.5px] text-stone-500">GST SUITE</div></div>
        </div>
        <span className="font-black text-[10px] text-[#ee1c3e] block lowercase">invoice</span>
        <span className="text-[3px] text-stone-500 block mb-1">QF-01234</span>
        <hr className="border-stone-400 my-1" />
        <div className="space-y-0.5">
          <span className="font-bold text-[3.5px]">Studio Nine Design</span>
          <span className="text-stone-500 block text-[3px]">+91-98765-43210</span>
        </div>
        <div className="flex-grow space-y-0.5 mt-1">
          <div className="flex justify-between font-bold text-[3px] border-b border-stone-400 pb-0.5">
            <span>DESC</span><span>QTY</span><span>TOTAL</span>
          </div>
          <div className="flex justify-between text-stone-600"><span>Website Dev</span><span>1</span><span>25,000</span></div>
          <div className="flex justify-between text-stone-600"><span>GST Module</span><span>1</span><span>12,000</span></div>
        </div>
        <div className="flex justify-end text-right mt-1">
          <div><span className="text-stone-500 text-[3px]">Subtotal: 47,200</span></div>
          <div className="font-bold text-[5px] text-[#ee1c3e]">TOTAL: ₹47,200</div>
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
    id: "maroon-geometric",
    name: "Maroon Geometric",
    category: "Creative",
    description: "Elegant serif design with maroon geometric accents and signature flourish.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-[#f7f6f5] text-[4px] leading-tight select-none relative overflow-hidden">
        <svg className="absolute top-0 right-0 w-8 h-4" viewBox="0 0 440 240">
          <polygon points="440,0 180,0 310,150" fill="#a41149" />
          <polygon points="440,0 440,240 240,0" fill="#1c1c1c" />
        </svg>
        <div className="relative z-[1]">
          <span className="font-bold text-[3px] text-[#a41149] tracking-widest block">QUOTEFLOW</span>
          <span className="font-black text-[10px] block" style={{fontFamily:"'Playfair Display', serif"}}>INVOICE</span>
          <span className="text-[3px] text-stone-500 block">NO: INV-20458-1</span>
        </div>
        <div className="grid grid-cols-2 gap-1 my-1 relative z-[1]">
          <div><span className="text-[#a41149] font-bold block">Bill To:</span><span className="font-bold block">Rosa Textiles</span></div>
          <div><span className="text-[#a41149] font-bold block">From:</span><span className="font-bold block">Aarav Mehta</span></div>
        </div>
        <div className="flex-grow space-y-0.5 relative z-[1]">
          <div className="flex justify-between bg-[#a41149] text-white p-0.5 font-bold text-[3px]">
            <span>DESC</span><span>QTY</span><span>TOTAL</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-[#c8395c] pb-0.5">
            <span>UI/UX Design</span><span>1</span><span>$12,000</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-[#c8395c] pb-0.5">
            <span>Frontend Dev</span><span>1</span><span>$15,500</span>
          </div>
        </div>
        <div className="flex justify-end mt-1 relative z-[1]">
          <div className="bg-[#1c1c1c] text-white p-0.5 rounded-sm flex justify-between font-bold text-[4px] w-16">
            <span>SUBTOTAL</span><span>₹36,750</span>
          </div>
        </div>
        <span className="text-right text-[#a41149] italic text-[5px] block relative z-[1]" style={{fontFamily:"'Dancing Script', cursive"}}>Thank You!</span>
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
    id: "minimal-freelancer",
    name: "Minimal Freelancer",
    category: "Minimal",
    description: "Clean gray-scale design with Poppins typography and decorative waves.",
    previewContent: (
      <div className="w-full h-full flex flex-col justify-between p-2.5 bg-white text-[4px] leading-tight select-none relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-stone-800 flex items-center justify-center text-white font-bold text-[3px]">Q</div>
            <span className="font-bold scale-75 origin-left">QUOTEFLOW</span>
          </div>
          <span className="font-extrabold text-[8px]" style={{fontFamily:"'Baloo 2', sans-serif"}}>INVOICE</span>
        </div>
        <span className="text-[3px] text-stone-400 mb-1">Date: 31 July, 2026</span>
        <div className="grid grid-cols-2 gap-1 mb-1">
          <div><span className="font-bold text-stone-400 text-[3px] block">Billed to:</span><span className="font-bold block text-[3.5px]">Studio Nine</span></div>
          <div><span className="font-bold text-stone-400 text-[3px] block">From:</span><span className="font-bold block text-[3.5px]">Aarav Mehta</span></div>
        </div>
        <div className="flex-grow space-y-0.5">
          <div className="flex justify-between border-b border-stone-200 pb-0.5 text-stone-400 font-bold text-[3px]">
            <span>ITEM</span><span>QTY</span><span>PRICE</span><span>AMOUNT</span>
          </div>
          <div className="flex justify-between text-[3px] border-b border-stone-100 pb-0.5">
            <span className="w-10">Logo Design</span><span>1</span><span>18,000</span><span>18,000</span>
          </div>
          <div className="flex justify-between text-[3px] border-b border-stone-100 pb-0.5">
            <span className="w-10">Banner (2x6m)</span><span>2</span><span>3,200</span><span>6,400</span>
          </div>
        </div>
        <div className="flex justify-end pt-1"><span className="font-bold text-[4px]">Total: ₹42,500</span></div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 100 20" style={{height:"8px"}} preserveAspectRatio="none">
          <path d="M0,10 C15,5 30,15 50,10 C65,5 75,10 100,8 L100,20 L0,20 Z" fill="#d9d9d9" opacity="0.4" />
          <path d="M0,14 C20,8 40,18 60,13 C75,9 85,13 100,11 L100,20 L0,20 Z" fill="#3f3f3f" opacity="0.08" />
        </svg>
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
  VyaparDesiTemplate: "gst-india",
  MinimalFreelancerTemplate: "minimal-freelancer",
  RedModernTemplate: "red-modern",
  MaroonGeometricTemplate: "maroon-geometric",
};

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  documentType = "invoice",
  currentValue = "StudioTemplate",
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>("Modern");
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentTemplateId = currentValue ? formValueToId[currentValue] : "";

  const currentTemplate = useMemo(
    () => PRESET_TEMPLATES.find((t) => t.id === currentTemplateId),
    [currentTemplateId]
  );

  const filteredTemplates = useMemo(() => {
    const isSupportedType = SUPPORTED_DOC_TYPES.includes(documentType.toLowerCase());
    if (!isSupportedType) return [];

    let templates = PRESET_TEMPLATES;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    } else {
      templates = templates.filter((t) => t.category === activeCategory);
    }

    return templates;
  }, [activeCategory, searchQuery, documentType]);

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    onClose();
  };

  useEffect(() => {
    if (isOpen && currentValue && !searchQuery) {
      const activeId = formValueToId[currentValue];
      const match = PRESET_TEMPLATES.find((t) => t.id === activeId);
      if (match) {
        setActiveCategory(match.category);
      }
    }
  }, [isOpen, currentValue, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-[90vw] max-w-[1500px] h-[88vh] flex flex-col overflow-hidden focus:outline-none animate-scale-in"
        style={{
          background: "rgba(18,18,22,0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-8 pb-6 flex items-start justify-between flex-shrink-0">
          <div>
            <h1
              className="text-[28px] font-bold tracking-tight"
              style={{ color: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Choose Template
            </h1>
            <p className="text-[15px] mt-1" style={{ color: "#A1A1AA" }}>
              Select a professional template for your document.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-white/10 cursor-pointer"
          >
            <svg className="w-5 h-5" style={{ color: "#A1A1AA" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category + Search Row */}
        <div className="px-10 pb-5 flex items-center gap-6 flex-shrink-0 flex-wrap">
          {/* Segmented Control */}
          <div
            className="flex items-center h-[44px] rounded-[999px] p-1 gap-1 flex-shrink-0"
            style={{
              background: "#111114",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className="px-5 h-full rounded-[999px] text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer"
                style={
                  activeCategory === cat && !searchQuery
                    ? {
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                        color: "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
                      }
                    : {
                        background: "transparent",
                        color: searchQuery ? "#3F3F46" : "#A1A1AA",
                      }
                }
                onMouseEnter={(e) => {
                  if (activeCategory !== cat || searchQuery) {
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat || searchQuery) {
                    e.currentTarget.style.color = searchQuery ? "#3F3F46" : "#A1A1AA";
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative" style={{ width: "300px", maxWidth: "100%" }}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: "#52525B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors duration-200"
              style={{
                background: "#111114",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#FFFFFF",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#7C3AED";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-4 scrollbar-thin">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={currentTemplateId === template.id}
                  onSelect={() => handleSelect(template.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-20 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <svg className="w-6 h-6" style={{ color: "#52525B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base" style={{ color: "#FFFFFF" }}>
                {searchQuery ? "No templates found" : "Unavailable Layout"}
              </h3>
              <p className="text-sm mt-1.5 max-w-sm" style={{ color: "#A1A1AA" }}>
                {searchQuery
                  ? `No templates match "${searchQuery}". Try a different search term.`
                  : `Document type "${documentType}" does not support custom layouts.`}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div
          className="flex-shrink-0 px-10 py-5 flex items-center justify-between"
          style={{
            background: "#111114",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "#A1A1AA" }}>
              Currently selected:
            </span>
            <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
              {currentTemplate?.name || "None"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ color: "#A1A1AA" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#A1A1AA"; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => currentTemplate && handleSelect(currentTemplate.id)}
              className="relative overflow-hidden px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-95 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #6D28D9, #9333EA)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #7C3AED, #A855F7)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)";
              }}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDialog;
