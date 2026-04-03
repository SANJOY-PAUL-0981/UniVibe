"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import collegeList from "@/data/college-names.json";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown, PlusCircle } from "lucide-react";

const colleges = collegeList as string[];

// Fuse performs the fuzzy score calculation internally using these knobs.
// `threshold` is the main strictness control: lower = stricter matches.
const fuse = new Fuse(colleges, {
  threshold: 0.18,
  distance: 100,
  minMatchCharLength: 3,
  shouldSort: true,
  includeScore: true,
});

function search(query: string, limit = 10): string[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const lower = q.toLowerCase();

  const exactMatches = colleges
    .filter((c) => c.toLowerCase().includes(lower))
    .slice(0, limit);

  if (exactMatches.length >= limit) return exactMatches;

  // This call is where fuzzy matching is evaluated and scored.
  // Fuse returns ranked results based on its internal edit-distance model
  // and the configuration above (especially `threshold` and `distance`).
  const fuzzyResults = fuse
    .search(q, { limit: limit * 2 })
    .map((r) => r.item)
    .filter((c) => !exactMatches.includes(c))
    .slice(0, limit - exactMatches.length);

  return [...exactMatches, ...fuzzyResults];
}

interface CollegePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CollegePicker({
  value,
  onChange,
  placeholder = "Search your college...",
}: CollegePickerProps) {
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = search(q);
    setResults(found);
    setOpen(found.length > 0);
    setHighlighted(0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val) onChange("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted < results.length) selectCollege(results[highlighted]);
      else selectManual();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectCollege = (name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  const selectManual = () => {
    onChange(query.trim());
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 pr-8"
          autoComplete="off"
        />
        <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Dropdown — fixed to input width, scrollable, won't overflow card */}
      {open && (
        <div
          className="absolute left-0 right-0 z-999 mt-1 rounded-md border border-border bg-popover shadow-lg"
          style={{ maxHeight: "180px", overflowY: "auto" }}
        >
          <ul role="listbox" className="py-1">
            {results.map((college, i) => (
              <li
                key={college}
                role="option"
                aria-selected={value === college}
                onMouseDown={() => selectCollege(college)}
                onMouseEnter={() => setHighlighted(i)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors text-sm",
                  highlighted === i
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground hover:bg-accent/50"
                )}
              >
                <span className="truncate pr-2">{college}</span>
                {value === college && (
                  <CheckIcon className="size-3.5 shrink-0 text-primary" />
                )}
              </li>
            ))}

            {/* Add manually — always at bottom */}
            {query.trim().length >= 2 && (
              <li
                role="option"
                onMouseDown={selectManual}
                onMouseEnter={() => setHighlighted(results.length)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer select-none transition-colors text-sm border-t border-border/50 text-muted-foreground",
                  highlighted === results.length
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <PlusCircle className="size-3.5 shrink-0" />
                <span className="truncate">
                  Add &quot;{query.trim()}&quot; manually
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Confirmed selection */}
      {value && !open && (
        <p className="mt-1 text-xs text-muted-foreground truncate">
          ✓ {value}
        </p>
      )}
    </div>
  );
}