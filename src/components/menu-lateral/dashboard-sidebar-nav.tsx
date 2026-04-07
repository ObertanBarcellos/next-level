'use client';

import {
  CalendarDays,
  Info,
  FileText,
  LayoutDashboard,
  List,
  MousePointer2,
  Move,
  Sparkles,
  Table2,
  TextCursorInput,
  ToggleLeft,
} from "lucide-react";
import SidebarNavItem from "@/src/components/menu-lateral/sidebar-nav-item";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/virtual-list", label: "Virtual List", icon: List },
  { href: "/drag-and-drop", label: "Drag and Drop", icon: Move },
  { href: "/data-grid", label: "Data Grid", icon: Table2 },
  { href: "/lucide-icons", label: "Lucide Icons", icon: Sparkles },
  { href: "/button", label: "Button", icon: MousePointer2 },
  { href: "/input", label: "Input", icon: TextCursorInput },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/form-manager", label: "Form Manager", icon: FileText },
  { href: "/switch-checkbox", label: "Switch e Checkbox", icon: ToggleLeft },
  { href: "/tooltip", label: "Tooltip", icon: Info },
] as const;

interface DashboardSidebarNavProps {
  isOpen: boolean;
}

export default function DashboardSidebarNav({ isOpen }: DashboardSidebarNavProps) {
  return (
    <nav className={`mt-12 flex pb-2 ${isOpen ? "flex-col gap-2" : "flex-col items-center gap-2.5"}`}>
      {DASHBOARD_LINKS.map((item) => (
        <SidebarNavItem
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isOpen={isOpen}
        />
      ))}
    </nav>
  );
}
