"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Label for a collapsed sidebar item. Place it inside the item: it shows on
// hover/focus of its parent element, rendered in a portal at a fixed position
// next to the item. A label inside the sidebar's scrolling nav would overflow
// the 80px sidebar and give the nav a horizontal scrollbar.
export function SidebarTooltip({ label }: { label: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const item = anchorRef.current?.parentElement;
    if (!item) return;
    const show = () => {
      const rect = item.getBoundingClientRect();
      // Just past the sidebar's edge, not over its border
      const edge = item.closest("aside")?.getBoundingClientRect().right ?? rect.right;
      setPos({ top: rect.top + rect.height / 2, left: edge + 8 });
    };
    const hide = () => setPos(null);
    item.addEventListener("mouseenter", show);
    item.addEventListener("focus", show);
    item.addEventListener("mouseleave", hide);
    item.addEventListener("blur", hide);
    item.addEventListener("click", hide);
    // The position would go stale once the nav scrolls
    window.addEventListener("scroll", hide, true);
    return () => {
      item.removeEventListener("mouseenter", show);
      item.removeEventListener("focus", show);
      item.removeEventListener("mouseleave", hide);
      item.removeEventListener("blur", hide);
      item.removeEventListener("click", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  return (
    <>
      <span ref={anchorRef} hidden />
      {pos && createPortal(
        <div
          role="tooltip"
          style={{ top: pos.top, left: pos.left }}
          className="fixed -translate-y-1/2 bg-black text-white text-xs px-2.5 py-1 rounded-lg z-[9999] whitespace-nowrap pointer-events-none shadow-lg"
        >
          {label}
        </div>,
        document.body
      )}
    </>
  );
}
