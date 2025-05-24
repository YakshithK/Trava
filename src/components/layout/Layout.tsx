
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen gradient-bg">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container p-6 md:p-8 max-w-7xl mx-auto">
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
