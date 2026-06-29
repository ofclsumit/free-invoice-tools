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
      onClick={onSelect}
      className={`group relative flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-white dark:bg-stone-900 border-2 ${
        isSelected
          ? "border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-stone-950 scale-[1.02]"
          : "border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:scale-[1.01]"
      }`}
    >
      {/* A4 Aspect Ratio Preview Area */}
      <div className="relative w-full aspect-[1/1.414] bg-stone-50 dark:bg-stone-950 border-b border-stone-150 dark:border-stone-850 overflow-hidden flex items-center justify-center p-2">
        {svgMarkup ? (
          <div 
            className="w-full h-full flex items-center justify-center select-none pointer-events-none"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          template.previewContent
        )}

        {/* Selected Overlay Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white shadow-sm animate-scale-in">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Template Info Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {template.name}
          </span>
          {isSelected && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              Selected
            </span>
          )}
        </div>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 line-clamp-2">
          {template.description}
        </p>
      </div>
    </button>
  );
};

export default TemplateCard;
