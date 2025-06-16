
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NotificationsTrigger from "@/features/notifications/components/NotificationsTrigger";

interface LayoutProps {
  children: ReactNode;
}

const FloatingTrigger = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  
  // Show floating trigger when sidebar is collapsed on desktop
  if (state === "expanded" || isMobile) {
    return null;
  }

  return (
    <Button
      onClick={toggleSidebar}
      size="icon"
      className="fixed top-4 left-4 z-50 shadow-lg hover:shadow-xl transition-all duration-200 bg-background border border-border hover:bg-accent"
      variant="outline"
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background">
        <Sidebar />
        <FloatingTrigger />
        <main className="flex-1 overflow-auto">
          <div className="container p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <BreadcrumbNav />
              <NotificationsTrigger />
            </div>
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
