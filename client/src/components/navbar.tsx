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
  FileText
} from "lucide-react";
import baltekIcon from "@/assets/baltek-icon.svg";

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  const { user, logout } = useAuth();
  const [notificationCount] = useState(3); // Mock unread notifications

  return (
    <nav className="navbar-sticky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <img src={baltekIcon} alt="Baltek" className="h-6 w-6" />
                <h1 className="text-xl font-bold text-primary">baltek jobs</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Messages */}
            <Link href="/chat">
              <Button variant="ghost" size="sm" data-testid="nav-messages">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
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
                    <span>Bookmarked Jobs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/applications" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Applications</span>
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
