import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bookmark,
  FileText,
  Briefcase,
  Sun,
  Moon,
  Palette,
  Globe,
  Monitor,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("english");
  const location = useLocation();

  const oauthLoginMutation = useMutation({
    mutationFn: async () => {
      return await AuthService.startOAuthLogin();
    },
    onMutate: async () => {
      // Show immediate feedback that login is starting
      toast({
        title: "Redirecting to login...",
        description: "Opening authentication page",
      });
      
      return {};
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to start OAuth login",
        variant: "destructive",
      });
    },
  });

  const handleOAuthLogin = () => {
    oauthLoginMutation.mutate();
  };

  // Fetch notifications only when on notifications page
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", "navbar"],
    queryFn: () => ApiClient.getNotifications({ page_size: 5 }),
    retry: false,
    enabled: !!user && location.pathname === "/notifications",
    staleTime: 30000, // Cache for 30 seconds to prevent unnecessary re-fetches
    refetchOnWindowFocus: false, // Prevent refetch on route changes
  });

  const notifications = notificationsData?.results || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLanguageChange = (newLanguage: string) => {
    // Show immediate feedback
    toast({
      title: "Changing language...",
      description: `Switching to ${newLanguage}`,
    });
    
    // Small delay to show the loading state
    setTimeout(() => {
      setLanguage(newLanguage);
      toast({
        title: "Language updated",
        description: `Language set to ${newLanguage}.`,
      });
    }, 200);
  };

  return (
    <nav className="navbar-sticky">
      <div className="layout-container-navbar">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <Link to="/jobs" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-lg sm:text-xl font-bold text-primary">baltek jobs</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications">
                  <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer" data-testid="nav-notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Messages */}
                <Link to="/chat">
                  <div className="w-8 h-8 flex items-center justify-center cursor-pointer" data-testid="nav-messages">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="User profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="font-medium">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.phone}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bookmarks" className="flex items-center">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Bookmarks</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/applications" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Applications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {/* Language Switcher */}
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      <Globe className="mr-2 h-4 w-4" />
                      <span className="flex-1">Language</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={language === "turkmen" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleLanguageChange("turkmen")}
                          className="h-6 w-6 p-0 text-xs"
                          title="Türkmen"
                        >
                          TM
                        </Button>
                        <Button
                          variant={language === "english" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleLanguageChange("english")}
                          className="h-6 w-6 p-0 text-xs"
                          title="English"
                        >
                          EN
                        </Button>
                        <Button
                          variant={language === "russian" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleLanguageChange("russian")}
                          className="h-6 w-6 p-0 text-xs"
                          title="Русский"
                        >
                          RU
                        </Button>
                      </div>
                    </div>
                    {/* Theme Switcher */}
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      <Palette className="mr-2 h-4 w-4" />
                      <span className="flex-1">Theme</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={theme === "light" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Switching theme...",
                              description: "Changing to light mode",
                            });
                            setTheme("light");
                            setTimeout(() => {
                              toast({
                                title: "Theme changed",
                                description: "Switched to light mode",
                              });
                            }, 300);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Sun className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Switching theme...",
                              description: "Changing to dark mode",
                            });
                            setTheme("dark");
                            setTimeout(() => {
                              toast({
                                title: "Theme changed",
                                description: "Switched to dark mode",
                              });
                            }, 300);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Moon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Switching theme...",
                              description: "Changing to system mode",
                            });
                            setTheme("system");
                            setTimeout(() => {
                              toast({
                                title: "Theme changed",
                                description: "Switched to system mode",
                              });
                            }, 300);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Monitor className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Theme toggle popup for unauthenticated users */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      data-testid="theme-toggle"
                    >
                      {theme === "light" ? (
                        <Sun className="h-4 w-4" />
                      ) : theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <div className="flex items-center justify-center gap-1 p-2">
                      <Button
                        variant={theme === "light" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="h-6 w-6 p-0"
                      >
                        <Sun className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="h-6 w-6 p-0"
                      >
                        <Moon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className="h-6 w-6 p-0"
                      >
                        <Monitor className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* OAuth Login button for unauthenticated users */}
                <Button size="sm" onClick={handleOAuthLogin}>
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
