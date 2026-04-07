import Card from "@/src/components/card/card";
import DashboardSidebarShell from "@/src/components/menu-lateral/dashboard-sidebar-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full flex-row overflow-hidden bg-zinc-50 font-sans">
      <DashboardSidebarShell />

      <div className="flex h-full min-h-0 min-w-0 w-full flex-1">
        <div className="h-full min-h-0 min-w-0 w-full">
          <Card className="h-full w-full overflow-y-auto overflow-x-hidden">{children}</Card>
        </div>
      </div>
    </div>
  );
}
