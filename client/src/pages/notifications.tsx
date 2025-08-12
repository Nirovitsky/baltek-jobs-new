import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BriefcaseIcon,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

interface ApiNotification {
  id: number;
  date_created: number;
  event: {
    type: string;
    date_created: number;
    content_type: string;
    object_id: number;
  };
  title: string;
  is_read: boolean;
}

interface Notification {
  id: number;
  type: "job_application" | "message" | "job_match" | "interview" | "system";
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

// Transform API notification to UI notification format
function transformNotification(apiNotification: ApiNotification): Notification {
  // Map notification types to UI types and determine priority
  const typeMapping: Record<string, { type: Notification["type"]; priority: Notification["priority"] }> = {
    JOB_APPLICATION_CREATED: { type: "job_application", priority: "high" },
    JOB_MATCH_CREATED: { type: "job_match", priority: "medium" },
    MESSAGE_RECEIVED: { type: "message", priority: "high" },
    INTERVIEW_SCHEDULED: { type: "interview", priority: "high" },
    SYSTEM_NOTIFICATION: { type: "system", priority: "low" },
    PROFILE_UPDATE: { type: "system", priority: "low" },
    default: { type: "system", priority: "medium" },
  };

  const mapping = typeMapping[apiNotification.event.type] || typeMapping.default;
  
  // Determine action URL based on notification type and related object
  let actionUrl: string | undefined;
  switch (apiNotification.event.type) {
    case "JOB_APPLICATION_CREATED":
      actionUrl = "/applications";
      break;
    case "MESSAGE_RECEIVED":
      actionUrl = "/chat";
      break;
    case "JOB_MATCH_CREATED":
      actionUrl = "/";
      break;
    case "PROFILE_UPDATE":
      actionUrl = "/profile";
      break;
    default:
      actionUrl = undefined;
  }

  // Parse the date with validation - API uses Unix timestamp
  let createdAt: Date;
  try {
    createdAt = new Date(apiNotification.date_created * 1000); // Convert Unix timestamp to milliseconds
    // Check if the date is invalid
    if (isNaN(createdAt.getTime())) {
      createdAt = new Date(); // Fallback to current date
    }
  } catch (error) {
    createdAt = new Date(); // Fallback to current date
  }

  return {
    id: apiNotification.id,
    type: mapping.type,
    title: apiNotification.title,
    description: apiNotification.title, // Use title as description since there's no separate message field
    isRead: apiNotification.is_read,
    createdAt,
    actionUrl,
    priority: mapping.priority,
  };
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "job_application":
      return <BriefcaseIcon className="w-4 h-4" />;
    case "message":
      return <MessageCircle className="w-4 h-4" />;
    case "job_match":
      return <CheckCircle className="w-4 h-4" />;
    case "interview":
      return <Clock className="w-4 h-4" />;
    case "system":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}) {
  const priorityColors = {
    low: "bg-muted text-foreground",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div
      className={`group relative border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
        !notification.isRead
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/50 shadow-sm"
          : "bg-card border-border hover:border-input"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            !notification.isRead
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow-sm"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <NotificationIcon type={notification.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <h3
                className={`font-semibold leading-tight ${
                  !notification.isRead
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {notification.title}
              </h3>
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              <Badge
                variant="secondary"
                className={`text-xs font-medium px-2 py-1 ${priorityColors[notification.priority]}`}
              >
                {notification.priority}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mb-4 leading-relaxed">
            {notification.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">
              {notification.createdAt && !isNaN(notification.createdAt.getTime()) 
                ? formatDistanceToNow(notification.createdAt, { addSuffix: true })
                : "Unknown time"}
            </span>

            <div className="flex gap-2">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs px-3 py-1.5 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                >
                  Mark as read
                </Button>
              )}
              {notification.actionUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = notification.actionUrl!)
                  }
                  className="text-xs px-3 py-1.5 hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                >
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch notifications from API with error handling for unimplemented endpoint
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => ApiClient.getNotifications({ page_size: 15 }),
    retry: false, // Don't retry on 500 errors
    retryOnMount: false,
  });

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      ApiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
    onError: (error: any) => {
      console.error("Mark as read error:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });





  // Mark all notifications as read mutation - handled individually since API doesn't provide bulk endpoint
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!notificationsData?.results) return;
      
      const unreadNotifications = notificationsData.results.filter(n => !n.is_read);
      
      // Mark each unread notification individually
      const promises = unreadNotifications.map(notification => 
        ApiClient.markNotificationAsRead(notification.id)
      );
      
      await Promise.all(promises);
      return { message: "All notifications marked as read" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error: any) => {
      console.error("Mark all as read error:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };





  // Transform API notifications to UI format
  const notifications = notificationsData?.results.map(transformNotification) || [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "read") return notification.isRead;
    return true; // "all" tab
  });

  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">
        {/* Mark all as read button - top right */}
        {unreadCount > 0 && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {markAllAsReadMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Marking all...
                </>
              ) : (
                "Mark all as read"
              )}
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-muted dark:bg-background p-1 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
            >
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger 
              value="read"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
            >
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground dark:text-gray-100 mb-3">
                    Notifications Coming Soon
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground/60 mb-6 leading-relaxed">
                    The notification system is being set up on the server. This feature will be available soon!
                  </p>
                  <div className="bg-white dark:bg-background rounded-xl p-6 text-left border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-foreground dark:text-muted-foreground/60 mb-3">In the meantime, you can:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground/60">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Check your applications page for updates
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Visit the chat page for messages
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Browse new job listings
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground/60 dark:text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground dark:text-gray-100 mb-3">
                  No notifications
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground/60">
                  {activeTab === "unread"
                    ? "You're all caught up! No unread notifications."
                    : activeTab === "read"
                      ? "No read notifications yet."
                      : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
