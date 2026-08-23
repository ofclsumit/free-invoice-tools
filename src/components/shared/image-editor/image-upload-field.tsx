"use client";

import React, { useState, useRef } from "react";
import { Upload, Plus, Pencil, Trash2, RefreshCw, Image as ImageIcon } from "lucide-react";
import { ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS, ImageAssetType } from "./types";
import { ImageEditorModal } from "./image-editor-modal";

export interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  originalValue?: string;
  settings?: ImageEditSettings;
  onChange: (value: string, originalValue: string, settings: ImageEditSettings) => void;
  onRemove: () => void;
  assetType?: ImageAssetType;
  title?: string;
  helpText?: string;
  aspectRatio?: "square" | "wide" | "signature" | "auto";
  compact?: boolean;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  originalValue,
  settings = DEFAULT_IMAGE_EDIT_SETTINGS,
  onChange,
  onRemove,
  assetType = "generic",
  title,
  helpText,
  aspectRatio = "auto",
  compact = false,
  className = "",
}: ImageUploadFieldProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawOriginal = originalValue || value || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Reset settings for new image upload
      onChange(dataUrl, dataUrl, DEFAULT_IMAGE_EDIT_SETTINGS);
    };
    reader.readAsDataURL(file);

    // Reset file input so selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyEdits = (editedDataUrl: string, newSettings: ImageEditSettings) => {
    onChange(editedDataUrl, rawOriginal, newSettings);
  };

  const getContainerDimensions = () => {
    if (compact) {
      return "w-24 h-24 sm:w-28 sm:h-28";
    }
    switch (aspectRatio) {
      case "signature":
        return "w-full max-w-sm h-28";
      case "wide":
        return "w-full h-36";
      case "square":
        return "w-32 h-32 sm:w-36 sm:h-36";
      default:
        return "w-full min-h-[90px] max-w-xs";
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        /* Image Present - Preview & Action Controls */
        <div className="space-y-2">
          <div
            className={`relative rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-900/60 overflow-hidden flex items-center justify-center p-2.5 transition-all shadow-xs ${getContainerDimensions()}`}
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(0,0,0,0.03) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.03) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.03) 75%)
              `,
              backgroundSize: "12px 12px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={title || label || "Uploaded Asset"}
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          </div>

          {/* Action Buttons: Change, Edit, Remove */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 border border-violet-200 dark:border-violet-800/60 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={onRemove}
              title="Remove image"
              aria-label="Remove image"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-white hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-zinc-700 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State - Click to Upload */
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-500 dark:border-zinc-700 dark:hover:border-violet-400 bg-slate-50/50 hover:bg-violet-50/20 dark:bg-zinc-900/40 dark:hover:bg-violet-950/10 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group shadow-xs ${getContainerDimensions()}`}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 dark:bg-zinc-800 dark:group-hover:bg-violet-950/80 text-slate-500 group-hover:text-violet-600 dark:text-zinc-400 dark:group-hover:text-violet-400 flex items-center justify-center mb-1.5 transition-colors">
            {assetType === "logo" ? (
              <ImageIcon className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-violet-700 dark:text-zinc-300 dark:group-hover:text-violet-300 transition-colors">
            {title || (assetType === "logo" ? "Add Logo" : assetType === "signature" ? "Add Signature" : "Upload Image")}
          </span>
          {helpText && (
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">
              {helpText}
            </span>
          )}
        </div>
      )}

      {/* Lightweight Reusable Editor Modal */}
      {isEditorOpen && rawOriginal && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          imageSrc={rawOriginal}
          initialSettings={settings}
          assetType={assetType}
          title={title}
          onApply={handleApplyEdits}
        />
      )}
    </div>
  );
}
