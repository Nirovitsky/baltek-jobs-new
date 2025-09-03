import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const getRouteMap = (t: (key: string) => string): Record<string, BreadcrumbItem[]> => ({
  "/profile": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.profile'), icon: User }
  ],
  "/applications": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.applications'), icon: Briefcase }
  ],
  "/bookmarks": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.bookmarks'), icon: Bookmark }
  ],
  "/settings": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.settings'), icon: Settings }
  ],
  "/chat": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.chat'), icon: MessageCircle }
  ],
  "/notifications": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.notifications'), icon: Bell }
  ],
  "/terms": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.settings'), href: "/settings", icon: Settings },
    { label: t('breadcrumb.terms') }
  ],
  "/privacy-policy": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.settings'), href: "/settings", icon: Settings },
    { label: t('breadcrumb.privacy_policy') }
  ],
  "/about-us": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.settings'), href: "/settings", icon: Settings },
    { label: t('breadcrumb.about_us') }
  ],
  "/contact-us": [
    { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
    { label: t('breadcrumb.settings'), href: "/settings", icon: Settings },
    { label: t('breadcrumb.contact_us') }
  ]
});

// Dynamic route pattern for company profiles
const getCompanyBreadcrumb = (path: string, t: (key: string) => string): BreadcrumbItem[] => {
  const companyIdMatch = path.match(/^\/company\/(\d+)$/);
  if (companyIdMatch) {
    return [
      { label: t('breadcrumb.home'), href: "/jobs", icon: Home },
      { label: t('breadcrumb.companies'), href: "/jobs", icon: Building },
      { label: t('breadcrumb.company_profile'), icon: Building }
    ];
  }
  return [];
};

export default function BreadcrumbNavigation() {
  const location = useLocation();
  const { t } = useTranslation();
  
  // Get breadcrumb items for current route
  let breadcrumbItems: BreadcrumbItem[] = [];
  
  const routeMap = getRouteMap(t);
  
  if (routeMap[location.pathname]) {
    breadcrumbItems = routeMap[location.pathname];
  } else {
    // Check for dynamic routes like company profiles
    breadcrumbItems = getCompanyBreadcrumb(location.pathname, t);
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
                          to={item.href!} 
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