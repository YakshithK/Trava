import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Users,
  MessageSquare,
  User,
  Mail,
  Sparkles
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
  const [profile, setProfile] = useState<{ first_name: string; avatar_url: string } | null>(null);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = () => {
    return profile?.first_name?.substring(0, 2).toUpperCase() || "U";
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("name, photo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setProfile({
          first_name: data.name,
          avatar_url: data.photo,
        });
      }
    };

    fetchProfile();
  }, [user?.id]);

  return (
    <ShadcnSidebar className="border-r border-border/50 glass-effect">
      <SidebarHeader className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <img
              src="/trava-high-resolution-logo-only-transparent.png"
              alt="Trava Logo"
              className="h-14 w-14 object-contain drop-shadow-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              Trava
            </span>
          </Link>
        </div>
        <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="space-y-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.path ||
                  (item.path === "/chat" && location.pathname.includes("/chat/"))
                }
                className="w-full justify-start h-12 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
              >
                <Link to={item.path} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path ||
                    (item.path === "/chat" && location.pathname.includes("/chat/"))
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-accent/30 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-100">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {profile?.first_name || "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground">Premium User</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="ghost" 
            size="sm"
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
