import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { countries } from "./countries-data";
import { cn } from "@/lib/utils";

export interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CountryCodeSelect({ value, onChange, className }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Find country. If no match is found, fallback to India (+91)
  const selectedCountry = countries.find(c => c.dial_code === value) || 
                          countries.find(c => c.dial_code === "+91") || 
                          countries[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dial_code.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 flex w-24 items-center justify-between gap-1 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-base leading-none">{selectedCountry?.flag}</span>
          <span className="font-medium">{selectedCountry?.dial_code}</span>
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-64 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-6 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground border-0 focus:ring-0 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 flex flex-col gap-0.5">
            {filteredCountries.length === 0 ? (
              <div className="py-2 text-center text-xs text-muted-foreground">No country found.</div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.dial_code === value && country.code === selectedCountry.code;
                return (
                  <button
                    key={`${country.code}-${country.dial_code}`}
                    type="button"
                    onClick={() => {
                      onChange(country.dial_code);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs outline-none hover:bg-accent hover:text-accent-foreground text-left gap-2",
                      isSelected && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="text-base leading-none shrink-0">{country.flag}</span>
                    <span className="truncate flex-1 font-medium">{country.name}</span>
                    <span className="text-muted-foreground shrink-0 text-[10px]">{country.dial_code}</span>
                    {isSelected && <Check className="h-3 w-3 shrink-0 ml-auto" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
