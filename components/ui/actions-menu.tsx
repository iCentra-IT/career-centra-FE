"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="4" r="1.4" fill="currentColor" />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
      <circle cx="9" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "default" | "danger" | "success";
}

const TONE_CLASSES: Record<NonNullable<ActionMenuItem["tone"]>, string> = {
  default: "text-gray-700 hover:bg-gray-50",
  danger: "text-red-600 hover:bg-red-50",
  success: "text-green-700 hover:bg-green-50",
};

const MENU_WIDTH = 208; // w-52

interface Position {
  left: number;
  // Exactly one of these is set — top when there's room below the button, bottom (measured from
  // the viewport's bottom edge) when the menu has to open upward instead.
  top?: number;
  bottom?: number;
}

// Shared kebab-menu action list for a table row — use whenever a row has more actions than
// comfortably fit as inline buttons. Destructive/async items are expected to open their own
// confirm modal or fire their own mutation from onClick; this component only handles the
// open/close chrome, not the actions themselves.
//
// Portaled to document.body with fixed positioning (rather than a plain `absolute` child of the
// button) because every caller renders this inside a scrollable table wrapper
// (`overflow-x-auto`). Per the CSS overflow spec, setting overflow-x without overflow-y forces
// overflow-y to compute as `auto` too, so a plain absolutely-positioned dropdown that would
// extend past the wrapper's bottom edge (e.g. opened from the table's last row) gets silently
// clipped. Portaling sidesteps that entirely, same reasoning as Modal's own portal.
export function ActionsMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8);
      const spaceBelow = window.innerHeight - rect.bottom;
      // ~8px gap + a rough allowance for the item list, same idea as a tooltip flipping when it
      // would otherwise run off the bottom of the viewport.
      const needsFlip = spaceBelow < 44 * items.length + 16;
      setPosition(
        needsFlip
          ? { left, bottom: window.innerHeight - rect.top + 4 }
          : { left, top: rect.bottom + 4 },
      );
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreIcon />
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ left: position.left, top: position.top, bottom: position.bottom, width: MENU_WIDTH }}
            className="fixed z-50 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg motion-safe:animate-pop-in"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                title={item.title}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${
                  TONE_CLASSES[item.tone ?? "default"]
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
