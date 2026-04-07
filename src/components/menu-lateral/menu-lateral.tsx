'use client';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/button/button";

export interface MenuLateralProps {
  children: React.ReactNode | ((state: { isOpen: boolean }) => React.ReactNode);
  bottomContent?: React.ReactNode | ((state: { isOpen: boolean }) => React.ReactNode);
  maxWidth?: number;
  initialOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  color?: string;
  className?: string;
  superimpose?: boolean;
}

export default function MenuLateral({
  children,
  bottomContent,
  initialOpen,
  maxWidth,
  onClose,
  onOpen,
  color,
  className,
  superimpose = false,
}: MenuLateralProps) {
  const [isOpen, setIsOpen] = useState(initialOpen ?? true);
  const expandedWidth = maxWidth ? `${maxWidth}px` : '280px';
  const collapsedWidth = '56px';

  const handleToggle = () => {
    setIsOpen((prevIsOpen) => {
      const nextIsOpen = !prevIsOpen;

      if (nextIsOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }

      return nextIsOpen;
    });
  };

  const resolvedChildren = typeof children === "function" ? children({ isOpen }) : children;
  const resolvedBottomContent = typeof bottomContent === "function" ? bottomContent({ isOpen }) : bottomContent;

  return (
    <div
      className={`${superimpose ? 'fixed left-0 top-0 z-40' : 'relative'} h-full overflow-hidden border-r border-white/10 transition-[width] duration-300 ease-in-out ${className ?? ''}`}
      data-menu-state={isOpen ? "open" : "collapsed"}
      style={{
        width: isOpen ? expandedWidth : collapsedWidth,
        background: color ?? 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 sidebar-background-grain" />
      <Button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? 'Minimizar menu lateral' : 'Expandir menu lateral'}
        variant="icon"
        tone="white"
        size="lg"
        className="absolute right-2 top-2 z-10 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {isOpen ? <ChevronLeft aria-hidden="true" size={24} /> : <ChevronRight aria-hidden="true" size={24} />}
      </Button>
      <div className={`relative flex h-full min-h-0 flex-col ${isOpen ? 'p-4 pt-3' : 'p-2 pt-14'}`}>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {resolvedChildren}
        </div>
        {resolvedBottomContent ? (
          <div className={`mt-4 shrink-0 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {resolvedBottomContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}