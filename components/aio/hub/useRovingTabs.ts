"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";

/**
 * The keyboard half of the WAI-ARIA tabs pattern: one tab in the tab order at
 * a time, arrows move between them (and select: "automatic activation"),
 * Home and End jump to the ends. `orientation: "both"` accepts up/down as well
 * as left/right, for a tablist that is a row on a phone and a column on a
 * desktop.
 */
export function useRovingTabs(count: number, orientation: "horizontal" | "both" = "horizontal") {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = useCallback(
    (index: number, focus = false) => {
      const next = ((index % count) + count) % count;
      setActive(next);
      if (focus) tabs.current[next]?.focus();
    },
    [count],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const prev = ["ArrowLeft", ...(orientation === "both" ? ["ArrowUp"] : [])];
      const next = ["ArrowRight", ...(orientation === "both" ? ["ArrowDown"] : [])];
      if (prev.includes(event.key)) select(active - 1, true);
      else if (next.includes(event.key)) select(active + 1, true);
      else if (event.key === "Home") select(0, true);
      else if (event.key === "End") select(count - 1, true);
      else return;
      event.preventDefault();
    },
    [active, count, orientation, select],
  );

  /** Props for the tab at `index`; spread onto its `<button>`. */
  const tabProps = (index: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      tabs.current[index] = el;
    },
    role: "tab" as const,
    type: "button" as const,
    "aria-selected": index === active,
    tabIndex: index === active ? 0 : -1,
    onClick: () => select(index),
  });

  return { active, select, onKeyDown, tabProps };
}
