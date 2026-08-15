import React from "react";

const TEMPLATES = [
  { id: "modern", name: "Modern" },
  { id: "corporate", name: "Corporate" },
  { id: "minimal", name: "Minimal" },
  { id: "gst-india", name: "GST India" },
  { id: "minimal-freelancer", name: "Minimal Freelancer" },
  { id: "red-modern", name: "Red Modern" },
  { id: "maroon-geometric", name: "Maroon Geometric" }
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

const idToFormValue: Record<string, string> = {
  modern: "StudioTemplate",
  corporate: "LedgerTemplate",
  minimal: "MinimalMonoTemplate",
  "gst-india": "VyaparDesiTemplate",
  "minimal-freelancer": "MinimalFreelancerTemplate",
  "red-modern": "RedModernTemplate",
  "maroon-geometric": "MaroonGeometricTemplate",
};

interface TemplateSelectorInlineProps {
  currentValue: string;
  onSelect: (formValue: string) => void;
  onOpenDialog: () => void;
}

export const TemplateSelectorInline: React.FC<TemplateSelectorInlineProps> = ({
  currentValue,
  onSelect,
  onOpenDialog,
}) => {
  const selectedId = formValueToId[currentValue] || "modern";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(idToFormValue[t.id])}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedId === t.id
              ? "bg-indigo-600 text-white shadow-sm"
              : "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850"
          }`}
        >
          {t.name}
        </button>
      ))}
      <button
        type="button"
        onClick={onOpenDialog}
        className="px-3.5 py-1.5 rounded-xl text-xs font-black border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 cursor-pointer"
      >
        View Previews
      </button>
    </div>
  );
};

export default TemplateSelectorInline;
