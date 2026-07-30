import React from "react";
import { Template } from "./types";
import { PREVIEW_SVGS } from "./previews";

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
}) => {
  const svgMarkup = PREVIEW_SVGS[template.id] || "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col text-left rounded-xl overflow-hidden transition-all duration-200 bg-white dark:bg-stone-900 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isSelected
          ? "border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-50/20 dark:shadow-stone-950/20 scale-[1.01]"
          : "border-stone-200 dark:border-stone-850 hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-md hover:scale-[1.02]"
      }`}
    >
      {/* A4 Aspect Ratio Preview Area */}
      <div className="relative w-full aspect-[1/1.414] bg-stone-50 dark:bg-stone-950 border-b border-stone-150 dark:border-stone-850 overflow-hidden flex items-center justify-center p-2.5">
        {svgMarkup ? (
          <div 
            className="w-full h-full flex items-center justify-center select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.03]"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]">
            {template.previewContent}
          </div>
        )}

        {/* Selected Badge */}
        {isSelected && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1 z-10 animate-scale-in">
            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Active
          </span>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-3 flex flex-col justify-between flex-grow bg-white dark:bg-stone-900">
        <div>
          <h3 className="font-bold text-[11px] text-stone-800 dark:text-stone-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
            {template.name}
          </h3>
          <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-1">
            {template.description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default TemplateCard;
