"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Folds the widget catalogue to a couple of rows until asked. The full list
 * stays in the DOM (clipped, not unmounted), so every widget's name and
 * description is still in the server HTML; the fold is only visual.
 */
export function CompactCatalogue({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div>
      <div
        id={id}
        className={cn("relative", !open && "max-h-[420px] overflow-hidden sm:max-h-[380px]")}
      >
        {children}
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-base via-base/80 to-transparent"
          />
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-4 py-2 font-display text-sm uppercase tracking-wide text-muted transition-colors hover:border-accent/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {open ? "Show fewer" : "Show every widget"}
          <ChevronDown size={16} aria-hidden className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}
