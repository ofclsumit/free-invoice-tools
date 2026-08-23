"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  RotateCcw as ResetIcon,
  Check,
  Move,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS, ImageAssetType } from "./types";
import { renderEditedImageToDataUrl } from "./canvas-utils";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string; // The original full-res image
  initialSettings?: ImageEditSettings;
  assetType?: ImageAssetType;
  title?: string;
  onApply: (editedDataUrl: string, settings: ImageEditSettings) => void;
}

export function ImageEditorModal({
  isOpen,
  onClose,
  imageSrc,
  initialSettings,
  assetType = "generic",
  title,
  onApply,
}: ImageEditorModalProps) {
  const [settings, setSettings] = useState<ImageEditSettings>(() => ({
    ...DEFAULT_IMAGE_EDIT_SETTINGS,
    ...(initialSettings || {}),
  }));

  const [isApplying, setIsApplying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });

  // Re-initialize settings when modal opens or initialSettings change
  useEffect(() => {
    if (isOpen) {
      setSettings({
        ...DEFAULT_IMAGE_EDIT_SETTINGS,
        ...(initialSettings || {}),
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialSettings]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  const displayTitle =
    title ||
    (assetType === "logo"
      ? "Edit Company Logo"
      : assetType === "signature"
      ? "Edit Signature"
      : assetType === "stamp" || assetType === "watermark"
      ? "Edit Stamp / Watermark"
      : "Edit Image");

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(0.5, Math.min(4, Math.round(newZoom * 100) / 100));
    setSettings((prev) => ({ ...prev, zoom: clamped }));
  };

  const handleRotate = (direction: "left" | "right") => {
    setSettings((prev) => {
      const delta = direction === "left" ? -90 : 90;
      let newRot = (prev.rotation + delta) % 360;
      if (newRot < 0) newRot += 360;
      return { ...prev, rotation: newRot };
    });
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_IMAGE_EDIT_SETTINGS });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: settings.positionX,
      posY: settings.positionY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setSettings((prev) => ({
      ...prev,
      positionX: Math.round(dragStartRef.current.posX + dx),
      positionY: Math.round(dragStartRef.current.posY + dy),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleApplyClick = async () => {
    setIsApplying(true);
    try {
      const editedUrl = await renderEditedImageToDataUrl(imageSrc, settings);
      onApply(editedUrl, settings);
      onClose();
    } catch (err) {
      console.error("Apply image edits failed:", err);
      onApply(imageSrc, settings);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-editor-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="image-editor-title"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {displayTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Adjust presentation, orientation &amp; corners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Interactive Preview Viewport */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-700/80 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors ${
                isDragging ? "border-violet-500 ring-2 ring-violet-500/20" : ""
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.04) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.04) 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                backgroundColor: "var(--tw-preview-bg, rgba(248, 250, 252, 0.8))",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Scaled/Transformed Image Container */}
              <div
                className="relative max-w-[80%] max-h-[80%] flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none"
                style={{
                  transform: `translate(${settings.positionX}px, ${settings.positionY}px) scale(${settings.zoom}) rotate(${settings.rotation}deg)`,
                  borderRadius: `${(settings.cornerSoftness / 2)}%`,
                  overflow: settings.cornerSoftness > 0 ? "hidden" : "visible",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Edit target preview"
                  className="max-h-48 max-w-full object-contain pointer-events-none drop-shadow-xs"
                  style={{
                    borderRadius: `${(settings.cornerSoftness / 2)}%`,
                  }}
                  draggable={false}
                />
              </div>

              {/* Reposition Hint Overlay Badge */}
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10.5px] font-medium backdrop-blur-xs flex items-center gap-1.5 pointer-events-none shadow-xs">
                <Move className="w-3 h-3 text-violet-300" />
                <span>Drag to reposition</span>
              </div>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="space-y-4 pt-1">
            {/* Zoom Controls */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  Zoom Size
                </span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">
                  {Math.round(settings.zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleZoomChange(settings.zoom - 0.1)}
                  disabled={settings.zoom <= 0.5}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.05"
                  value={settings.zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  aria-label="Zoom level"
                  className="flex-1 accent-violet-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleZoomChange(settings.zoom + 0.1)}
                  disabled={settings.zoom >= 4}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corner Softness (Radius) Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  Corner Softness
                </span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">
                  {settings.cornerSoftness}% {settings.cornerSoftness === 0 ? "(Sharp)" : settings.cornerSoftness === 100 ? "(Pill)" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.cornerSoftness}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      cornerSoftness: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  aria-label="Corner Softness slider"
                  className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                />
              </div>
            </div>

            {/* Rotation & Reset Row */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Rotation:
                </span>
                <button
                  type="button"
                  onClick={() => handleRotate("left")}
                  title="Rotate Left (-90°)"
                  aria-label="Rotate Left 90 degrees"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate("right")}
                  title="Rotate Right (+90°)"
                  aria-label="Rotate Right 90 degrees"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 pl-1">
                  ({settings.rotation}°)
                </span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                title="Reset all adjustments to default"
                aria-label="Reset adjustments"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ResetIcon className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={isApplying}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isApplying ? "Applying..." : "Apply Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
