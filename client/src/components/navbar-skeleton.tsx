import { Skeleton } from "@/components/ui/skeleton";
import { Bell, MessageCircle, User } from "lucide-react";
import baltekIcon from "@/assets/baltek-icon.svg";

export default function NavbarSkeleton() {
  return (
    <nav className="navbar-sticky">
      <div className="layout-container-navbar">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <img src={baltekIcon} alt="Baltek" className="h-10 w-10" />
                <h1 className="text-xl font-bold text-primary">baltek jobs</h1>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Notifications skeleton */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Bell className="h-5 w-5 text-muted-foreground/60" />
            </div>

            {/* Messages skeleton */}
            <div className="w-8 h-8 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-muted-foreground/60" />
            </div>

            {/* User Menu skeleton */}
            <div className="w-8 h-8 bg-muted/60 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}