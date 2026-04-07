'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isOpen: boolean;
}

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNavItem({ href, label, icon: Icon, isOpen }: SidebarNavItemProps) {
  const pathname = usePathname() ?? "";
  const isActive = isItemActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      title={!isOpen ? label : undefined}
      className={`group relative flex overflow-hidden border text-sm font-medium backdrop-blur-sm transition-all duration-300
        ${isOpen ? "items-center gap-2.5 rounded-xl px-3 py-2.5" : "h-9 w-9 items-center justify-center rounded-lg"}
        ${isActive
          ? "border-cyan-300/50 bg-gradient-to-r from-cyan-400/30 via-sky-400/20 to-transparent text-white shadow-[0_10px_30px_-16px_rgba(34,211,238,0.95)]"
          : "border-white/10 bg-white/0 text-white/80 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
    >
      <span
        className={`absolute bg-cyan-300 transition-all duration-300
          ${isOpen ? "left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" : "bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-t-full"}
          ${isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 group-hover:opacity-70 group-hover:scale-y-75"}`}
      />
      <Icon
        size={16}
        className={`relative transition-transform duration-300 ${isActive ? "text-cyan-200" : "text-white/70 group-hover:scale-110 group-hover:text-white"}`}
        aria-hidden="true"
      />
      {isOpen ? <span className="relative">{label}</span> : null}
      <span
        className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300
          ${isActive ? "opacity-100 sidebar-active-shine" : "opacity-0 group-hover:opacity-100 sidebar-hover-shine"}`}
      />
    </Link>
  );
}
