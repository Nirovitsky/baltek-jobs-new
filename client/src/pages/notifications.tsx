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
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string;
  related_object_id?: number;
  related_object_type?: string;
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
    application: { type: "job_application", priority: "high" },
    job_match: { type: "job_match", priority: "medium" },
    message: { type: "message", priority: "high" },
    interview: { type: "interview", priority: "high" },
    system: { type: "system", priority: "low" },
    profile: { type: "system", priority: "low" },
    default: { type: "system", priority: "medium" },
  };

  const mapping = typeMapping[apiNotification.notification_type] || typeMapping.default;
  
  // Determine action URL based on notification type and related object
  let actionUrl: string | undefined;
  switch (apiNotification.notification_type) {
    case "application":
      actionUrl = "/applications";
      break;
    case "message":
      actionUrl = "/chat";
      break;
    case "job_match":
      actionUrl = "/";
      break;
    case "profile":
      actionUrl = "/profile";
      break;
    default:
      actionUrl = undefined;
  }

  return {
    id: apiNotification.id,
    type: mapping.type,
    title: apiNotification.title,
    description: apiNotification.message,
    isRead: apiNotification.is_read,
    createdAt: new Date(apiNotification.created_at),
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
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const priorityColors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card
      className={`mb-3 transition-all hover:shadow-md ${
        !notification.isRead
          ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-full ${
                !notification.isRead
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <NotificationIcon type={notification.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`font-medium ${
                    !notification.isRead
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <Badge
                  variant="secondary"
                  className={`text-xs ${priorityColors[notification.priority]}`}
                >
                  {notification.priority}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {notification.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </span>

                <div className="flex gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs px-2 py-1"
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
                      className="text-xs px-2 py-1"
                    >
                      View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch notifications from API with error handling for server issues
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        return await ApiClient.getNotifications({ page_size: 50 });
      } catch (err: any) {
        // Log the actual error for debugging
        console.error("Notifications API error:", err);
        throw err;
      }
    },
    retry: false, // Don't retry on server errors
    retryOnMount: false,
  });

  // Mark single notification as read mutation (disabled when API unavailable)
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
      toast({
        title: "Feature Coming Soon",
        description: "Notification management will be available when the server feature is ready",
        variant: "default",
      });
    },
  });

  // Mark all notifications as read mutation (disabled when API unavailable)
  const markAllAsReadMutation = useMutation({
    mutationFn: () => ApiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feature Coming Soon",
        description: "Notification management will be available when the server feature is ready",
        variant: "default",
      });
    },
  });

  // Delete notification mutation (disabled when API unavailable)
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) =>
      ApiClient.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feature Coming Soon",
        description: "Notification management will be available when the server feature is ready",
        variant: "default",
      });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: number) => {
    deleteNotificationMutation.mutate(id);
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
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <BreadcrumbNavigation />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your job search activity
              </p>
            </div>
            <div className="flex gap-2">
              {!isError && unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-sm"
                >
                  {markAllAsReadMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    "Mark all as read"
                  )}
                </Button>
              )}
              {!isError && (
                <Button
                  variant="ghost"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isError ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">
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
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Notifications Under Development
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The notification system is being updated on the server. We're working to resolve this issue.
                  </p>
                  <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <p>You can stay updated through:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <BriefcaseIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="font-medium text-blue-900 dark:text-blue-100">Applications</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Track your job applications</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-900 dark:text-green-100">Messages</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Chat with recruiters</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="font-medium text-purple-900 dark:text-purple-100">Jobs</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Find new opportunities</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeTab === "unread"
                      ? "You're all caught up! No unread notifications."
                      : activeTab === "read"
                        ? "No read notifications yet."
                        : "You don't have any notifications yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-0">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Notifications Under Development
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The notification system is being updated on the server. We're working to resolve this issue.
              </p>
              <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <p>You can stay updated through:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <BriefcaseIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-blue-900 dark:text-blue-100">Applications</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Track your job applications</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-900 dark:text-green-100">Messages</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Chat with recruiters</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-purple-900 dark:text-purple-100">Jobs</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Find new opportunities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
