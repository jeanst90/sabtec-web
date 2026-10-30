import Sidebar from "@/components/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="content" className="min-w-0 flex-1 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0">
        <MobileNav />
        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
