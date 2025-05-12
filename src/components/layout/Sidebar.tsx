
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  PlusCircle, 
  Users, 
  MessageSquare, 
  User,
  Mail
} from "lucide-react";
import { 
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";

const navigationItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Post Trip", path: "/trip-posting", icon: PlusCircle },
  { name: "Matches", path: "/matches", icon: Users },
  { name: "Requests", path: "/requests", icon: Mail },
  { name: "Chat", path: "/chat", icon: MessageSquare },
  { name: "Profile", path: "/profile", icon: User },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-green-500">
              SaathSafar
            </span>
          </Link>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton 
                asChild
                isActive={location.pathname === item.path || 
                  (item.path === "/chat" && location.pathname.includes("/chat/"))}
                tooltip={item.name}
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="ghost" 
            size="sm"
          >
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
