import { useLocation, Link } from "wouter";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, User, Briefcase, Bookmark, Settings, MessageCircle, Bell, Building } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const routeMap: Record<string, BreadcrumbItem[]> = {
  "/profile": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Profile", icon: User }
  ],
  "/applications": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Applications", icon: Briefcase }
  ],
  "/bookmarks": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Bookmarks", icon: Bookmark }
  ],
  "/settings": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Settings", icon: Settings }
  ],
  "/chat": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Chat", icon: MessageCircle }
  ],
  "/notifications": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Notifications", icon: Bell }
  ],
  "/terms": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Terms and Agreement" }
  ],
  "/privacy-policy": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Privacy Policy" }
  ],
  "/about-us": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "About Us" }
  ],
  "/contact-us": [
    { label: "Home", href: "/jobs", icon: Home },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Contact Us" }
  ]
};

// Dynamic route pattern for company profiles
const getCompanyBreadcrumb = (path: string): BreadcrumbItem[] => {
  const companyIdMatch = path.match(/^\/company\/(\d+)$/);
  if (companyIdMatch) {
    return [
      { label: "Home", href: "/jobs", icon: Home },
      { label: "Companies", href: "/jobs", icon: Building },
      { label: "Company Profile", icon: Building }
    ];
  }
  return [];
};

export default function BreadcrumbNavigation() {
  const [location] = useLocation();
  
  // Get breadcrumb items for current route
  let breadcrumbItems: BreadcrumbItem[] = [];
  
  if (routeMap[location]) {
    breadcrumbItems = routeMap[location];
  } else {
    // Check for dynamic routes like company profiles
    breadcrumbItems = getCompanyBreadcrumb(location);
  }

  // Don't render if no breadcrumb items found
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <div className="h-[72px] bg-background border-b border-border flex items-center">
      <div className="layout-container-body">
        <Breadcrumb className="breadcrumb-stable">
          <BreadcrumbList className="min-h-[20px] flex items-center gap-0 breadcrumb-stable">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              const Icon = item.icon;
              
              return (
                <BreadcrumbItem key={index} className="shrink-0 flex items-center">
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-2 text-foreground font-medium whitespace-nowrap">
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="shrink-0">{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link 
                          href={item.href!} 
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                          data-testid={`breadcrumb-link-${item.label.toLowerCase()}`}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span className="shrink-0">{item.label}</span>
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator className="shrink-0 mx-2" />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}