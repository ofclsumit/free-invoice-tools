"use client"

import React, { useState, useRef, useEffect, useId, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, Search, X } from "lucide-react"

export interface TurnivoSelectOption {
  value: string
  label: string
  sub?: string
  icon?: React.ReactNode
  badge?: string
  disabled?: boolean
}

export interface TurnivoSelectProps {
  value: string
  onChange: (value: string) => void
  options: TurnivoSelectOption[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
  triggerClassName?: string
  menuClassName?: string
  ariaLabel?: string
  size?: "sm" | "md" | "lg"
  align?: "left" | "right"
}

export function TurnivoSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  searchable = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  ariaLabel,
  size = "md",
  align = "left",
}: TurnivoSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [openUpward, setOpenUpward] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const id = useId()
  const listboxId = `${id}-listbox`
  const triggerId = `${id}-trigger`

  // Selected Option
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  // Filtered Options (if searchable)
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sub && opt.sub.toLowerCase().includes(q))
    )
  }, [options, searchQuery, searchable])

  // Smart Collision Detection (Flip Upward if close to bottom)
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedHeight = Math.min(filteredOptions.length * 40 + (searchable ? 48 : 16), 300)

    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      setOpenUpward(true)
    } else {
      setOpenUpward(false)
    }
  }, [isOpen, filteredOptions.length, searchable])

  // Focus Search Input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen, searchable])

  // Reset focus index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = filteredOptions.findIndex((opt) => opt.value === value)
      setFocusedIndex(idx >= 0 ? idx : 0)
    } else {
      setSearchQuery("")
      setFocusedIndex(-1)
    }
  }, [isOpen, filteredOptions, value])

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const itemEl = listRef.current.children[focusedIndex] as HTMLElement
      if (itemEl) {
        itemEl.scrollIntoView({ block: "nearest" })
      }
    }
  }, [focusedIndex, isOpen])

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => {
            const next = prev + 1
            return next < filteredOptions.length ? next : 0
          })
        }
        break

      case "ArrowUp":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => {
            const next = prev - 1
            return next >= 0 ? next : filteredOptions.length - 1
          })
        }
        break

      case "Home":
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(0)
        }
        break

      case "End":
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(filteredOptions.length - 1)
        }
        break

      case "Enter":
      case " ":
        if (isOpen && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          e.preventDefault()
          const opt = filteredOptions[focusedIndex]
          if (!opt.disabled) {
            onChange(opt.value)
            setIsOpen(false)
            triggerRef.current?.focus()
          }
        } else if (!isOpen) {
          e.preventDefault()
          setIsOpen(true)
        }
        break

      case "Escape":
        if (isOpen) {
          e.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
        }
        break

      case "Tab":
        if (isOpen) {
          setIsOpen(false)
        }
        break
    }
  }

  // Sizing tokens
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs rounded-lg min-h-[32px]",
    md: "px-3 py-2 text-xs sm:text-sm rounded-xl min-h-[38px]",
    lg: "px-4 py-2.5 text-sm rounded-xl min-h-[44px]",
  }[size]

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* TRIGGER BUTTON */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || placeholder}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 text-left transition-all duration-150 outline-none
          bg-white dark:bg-[#0f172a] 
          text-[#111827] dark:text-slate-100 
          border border-[#CBD5E1] dark:border-white/10 
          hover:border-slate-400 dark:hover:border-white/20
          focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
          shadow-xs disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses} ${triggerClassName}`}
      >
        <span className="flex items-center gap-2 truncate flex-1 min-w-0">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0 text-slate-500 dark:text-slate-400">
                  {selectedOption.icon}
                </span>
              )}
              <span className="truncate font-medium">{selectedOption.label}</span>
              {selectedOption.sub && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate hidden xs:inline">
                  {selectedOption.sub}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpward ? 4 : -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className={`absolute z-50 w-full min-w-[180px] bg-white dark:bg-[#0f172a] border border-[#CBD5E1] dark:border-white/15 rounded-xl shadow-lg overflow-hidden
              ${openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"}
              ${align === "right" ? "right-0" : "left-0"}
              ${menuClassName}`}
          >
            {/* Search Input if enabled */}
            {searchable && (
              <div className="p-2 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/20">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-xs min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OPTIONS LIST */}
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel || placeholder}
              className="max-h-[280px] sm:max-h-[300px] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  No matching options
                </li>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value
                  const isFocused = idx === focusedIndex

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange(opt.value)
                          setIsOpen(false)
                          triggerRef.current?.focus()
                        }
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`px-3 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors duration-75
                        ${
                          opt.disabled
                            ? "opacity-40 cursor-not-allowed"
                            : isSelected
                            ? "bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-semibold"
                            : isFocused
                            ? "bg-[#F1F5F9] dark:bg-white/5 text-[#111827] dark:text-slate-100"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.icon && (
                          <span className="shrink-0 text-current opacity-80">
                            {opt.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">{opt.label}</span>
                          {opt.sub && (
                            <span className="block text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
                              {opt.sub}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
