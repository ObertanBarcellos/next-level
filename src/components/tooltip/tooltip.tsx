"use client";

import React, {
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom" | "left" | "right";
type TooltipTheme = "light" | "dark";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  side?: TooltipSide;
  offset?: number;
  maxWidth?: number;
  theme?: TooltipTheme;
  zIndex?: number;
}

interface Coords {
  left: number;
  top: number;
  transform: string;
}

function getCoords(rect: DOMRect, side: TooltipSide, offset: number): Coords {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  if (side === "bottom") {
    return { left: centerX, top: rect.bottom + offset, transform: "translate(-50%, 0)" };
  }
  if (side === "left") {
    return { left: rect.left - offset, top: centerY, transform: "translate(-100%, -50%)" };
  }
  if (side === "right") {
    return { left: rect.right + offset, top: centerY, transform: "translate(0, -50%)" };
  }
  return { left: centerX, top: rect.top - offset, transform: "translate(-50%, -100%)" };
}

export function Tooltip({
  children,
  content,
  side = "top",
  offset = 10,
  maxWidth = 360,
  theme = "light",
  zIndex = 2147483647,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const tooltipId = useId();

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const next = getCoords(rect, side, offset);
    setCoords({
      left: Math.max(8, Math.min(window.innerWidth - 8, next.left)),
      top: Math.max(8, Math.min(window.innerHeight - 8, next.top)),
      transform: next.transform,
    });
  };

  const scheduleUpdate = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateCoords);
  };

  useEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("resize", scheduleUpdate, true);
    window.addEventListener("scroll", scheduleUpdate, true);
    return () => {
      window.removeEventListener("resize", scheduleUpdate, true);
      window.removeEventListener("scroll", scheduleUpdate, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, side, offset]);

  const portalRoot = useMemo(() => {
    if (typeof window === "undefined") return null;
    let node = document.getElementById("tooltip-root");
    if (!node) {
      node = document.createElement("div");
      node.id = "tooltip-root";
      document.body.appendChild(node);
    }
    return node;
  }, []);

  if (!isValidElement(children)) return null;

  const originalProps = children.props as Record<string, unknown>;

  const trigger = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    onClick: (event: React.MouseEvent) => {
      const cb = originalProps.onClick as ((e: React.MouseEvent) => void) | undefined;
      cb?.(event);
    },
    onMouseEnter: (event: React.MouseEvent) => {
      setOpen(true);
      scheduleUpdate();
      const cb = originalProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined;
      cb?.(event);
    },
    onMouseLeave: (event: React.MouseEvent) => {
      setOpen(false);
      const cb = originalProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined;
      cb?.(event);
    },
    onFocus: (event: React.FocusEvent) => {
      setOpen(true);
      scheduleUpdate();
      const cb = originalProps.onFocus as ((e: React.FocusEvent) => void) | undefined;
      cb?.(event);
    },
    onBlur: (event: React.FocusEvent) => {
      setOpen(false);
      const cb = originalProps.onBlur as ((e: React.FocusEvent) => void) | undefined;
      cb?.(event);
    },
    "aria-describedby": open ? tooltipId : originalProps["aria-describedby"],
  });

  const shellClass =
    theme === "dark"
      ? "border-zinc-700 bg-zinc-900 text-zinc-100 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)]"
      : "border-zinc-200 bg-white text-zinc-800 shadow-[0_24px_60px_-28px_rgba(2,6,23,0.35)]";

  return (
    <>
      {trigger}
      {open && portalRoot && coords
        ? createPortal(
            <div className="pointer-events-none fixed inset-0" style={{ zIndex }}>
              <div
                id={tooltipId}
                role="tooltip"
                className={`absolute w-max rounded-xl border px-3 py-2 text-sm ${shellClass}`}
                style={{
                  left: coords.left,
                  top: coords.top,
                  maxWidth,
                  transform: coords.transform,
                }}
              >
                {content}
              </div>
            </div>,
            portalRoot
          )
        : null}
    </>
  );
}

