import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Users,
  MessageSquare,
  User,
  Mail,
  Sparkles,
  LogOut
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
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BugDialog } from "./BugDialog";
import { useTranslation } from "react-i18next";

const navigationItems = [
  { name: "dashboard", path: "/dashboard", icon: Home },
  { name: "postTrip", path: "/trip-posting", icon: PlusCircle },
  { name: "matches", path: "/matches", icon: Users },
  { name: "requests", path: "/requests", icon: Mail },
  { name: "chat", path: "/chat", icon: MessageSquare },
  { name: "profile", path: "/profile", icon: User },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [profile, setProfile] = useState<{ first_name: string; email: string; avatar_url: string } | null>(null);
  const [showBugDialog, setShowBugDialog] = useState(false);

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
        .select("name, email, photo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setProfile({
          first_name: data.name,
          email: data.email,
          avatar_url: data.photo,
        });
      }
    };

    fetchProfile();
  }, [user?.id]);

  return (
    <>
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
                  <span className="font-medium">{t(`navigation.${item.name}`)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 space-y-4">
        {/* User Info Section */}
        <div className="flex items-center space-x-3 px-2 py-3 rounded-lg bg-accent/20 border border-border/30">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-100 text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.first_name || t('sidebar.loading')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="space-y-3">
          {/* Theme Toggle Row */}
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-muted-foreground">{t('sidebar.theme')}</span>
            <ThemeToggle />
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowBugDialog(true)} 
              variant="outline" 
              size="sm"
              className="flex-1 h-9 text-xs hover:bg-accent/50 transition-colors"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {t('sidebar.reportBug')}
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="flex-1 h-9 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              <LogOut className="h-3 w-3 mr-1" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>

      <BugDialog
        isOpen={showBugDialog}
        onClose={() => setShowBugDialog(false)}
        user={user}
      />
    </>
  );
};

export default Sidebar;
