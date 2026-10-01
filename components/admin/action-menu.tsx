"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
type Action = {
  label: string;
  href?: string;
  run?: () => void;
  disabled?: boolean;
};
export function ActionMenu({
  label,
  items,
}: {
  label: string;
  items: Action[];
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const close = () => {
    setPosition(null);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!position) return;
    menu.current?.querySelector<HTMLElement>("a,button")?.focus();
    const outside = (e: PointerEvent) => {
      if (
        !menu.current?.contains(e.target as Node) &&
        !trigger.current?.contains(e.target as Node)
      )
        setPosition(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPosition(null);
        trigger.current?.focus();
      }
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const list = Array.from(
          menu.current?.querySelectorAll<HTMLElement>(
            "a,button:not(:disabled)",
          ) ?? [],
        );
        const index = list.indexOf(document.activeElement as HTMLElement);
        list[
          (index + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length
        ]?.focus();
      }
    };
    const hide = () => setPosition(null);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [position]);
  return (
    <>
      <button
        ref={trigger}
        className="admin-ghost"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
        onClick={() => {
          if (position) {
            close();
            return;
          }
          const box = trigger.current?.getBoundingClientRect();
          if (box)
            setPosition({
              left: Math.max(8, Math.min(innerWidth - 190, box.right - 180)),
              top: Math.max(
                8,
                Math.min(innerHeight - items.length * 38 - 20, box.bottom + 5),
              ),
            });
        }}
      >
        ⋯
      </button>
      {position &&
        createPortal(
          <div
            ref={menu}
            className="admin-popup-menu"
            role="menu"
            aria-label={label}
            style={position}
          >
            {items.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={close}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    close();
                    item.run?.();
                  }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
