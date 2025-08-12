import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { Link } from "wouter";
import {
  Search,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Heart,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import baltekIcon from "@/assets/baltek-icon.svg";

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  const { user, logout } = useAuth();

  // Fetch notifications for the dropdown
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", "navbar"],
    queryFn: () => ApiClient.getNotifications({ page_size: 5 }),
    retry: false,
    enabled: !!user,
  });

  const notifications = notificationsData?.results || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="navbar-sticky">
      <div className="layout-container-navbar">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <img src={baltekIcon} alt="Baltek" className="h-10 w-10" />
                <h1 className="text-xl font-bold text-primary">baltek jobs</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <Link href="/notifications" className="text-xs text-blue-600 hover:text-blue-700">
                      View all
                    </Link>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                          !notification.is_read ? "bg-blue-50 dark:bg-blue-950/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.is_read ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {notification.title || "Notification"}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.event?.type === "JOB_APPLICATION_CREATED" 
                                ? "New job application submitted"
                                : "Notification update"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.date_created
                                ? formatDistanceToNow(new Date(notification.date_created * 1000), {
                                    addSuffix: true,
                                  })
                                : "Unknown time"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
                    <Link href="/notifications">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View all notifications
                      </Button>
                    </Link>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Messages */}
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="nav-messages">
                <MessageCircle className="h-5 w-5" />
              </Button>
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
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Bookmarks</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/applications" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Applications</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
