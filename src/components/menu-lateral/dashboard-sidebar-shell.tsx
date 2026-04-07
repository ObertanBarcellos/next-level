'use client';

import MenuLateral from "@/src/components/menu-lateral/menu-lateral";
import DashboardSidebarNav from "@/src/components/menu-lateral/dashboard-sidebar-nav";

export default function DashboardSidebarShell() {
  return (
    <MenuLateral
      initialOpen
      color="linear-gradient(180deg, #0f172a 0%, #111827 45%, #020617 100%)"
      maxWidth={320}
      bottomContent={() => (
        <div className="border-t border-white/15 pt-3 text-white">
          <p className="text-sm font-medium text-white/90">Usuario Padrão</p>
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium transition-all duration-300 hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
          >
            Sair
          </button>
        </div>
      )}
    >
      {({ isOpen }) => <DashboardSidebarNav isOpen={isOpen} />}
    </MenuLateral>
  );
}
