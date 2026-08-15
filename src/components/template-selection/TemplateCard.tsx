import React from "react";
import { Template } from "./types";
import { PREVIEW_SVGS } from "./previews";

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  index?: number;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  index = 0,
}) => {
  const svgMarkup = PREVIEW_SVGS[template.id] || "";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`
        group relative w-full max-w-[280px] h-[400px] flex flex-col
        bg-white rounded-2xl overflow-hidden cursor-pointer text-left
        transition-all duration-[250ms] ease-out
        shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_30px_rgba(124,58,237,0.12),0_2px_8px_rgba(0,0,0,0.06)]
        hover:-translate-y-1.5 hover:scale-[1.02]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40
        animate-fade-in opacity-0 [animation-fill-mode:forwards]
        ${isSelected
          ? "ring-2 ring-[#7C3AED] shadow-[0_0_24px_rgba(124,58,237,0.2)]"
          : "ring-0"
        }
      `}
    >
      {/* Preview Area */}
      <div className="flex-1 w-full bg-stone-50 flex items-center justify-center p-3 overflow-hidden">
        {svgMarkup ? (
          <div
            className="w-full h-full flex items-center justify-center select-none pointer-events-none transition-transform duration-[250ms] group-hover:scale-[1.03]"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="w-full h-full transition-transform duration-[250ms] group-hover:scale-[1.03]">
            {template.previewContent}
          </div>
        )}
      </div>

      {/* Selected Check Icon */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.4)] z-10">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Info Footer */}
      <div className="px-4 py-3 bg-white border-t border-stone-100">
        <h3 className="text-sm font-semibold text-stone-800 group-hover:text-[#7C3AED] transition-colors duration-200 truncate">
          {template.name}
        </h3>
        <p className="text-[11px] text-stone-400 mt-0.5 truncate">
          {template.description}
        </p>
      </div>
    </button>
  );
};

export default TemplateCard;
