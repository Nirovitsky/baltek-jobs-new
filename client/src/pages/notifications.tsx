import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  Calendar,
  CalendarX,
  User,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
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
  eventType?: string; // Original API event type for more specific handling
}

// Generate a better description based on notification type and content
function generateNotificationDescription(apiNotification: ApiNotification, t: (key: string) => string): string {
  const eventType = apiNotification.event.type;
  const title = apiNotification.title;

  switch (eventType) {
    case "JOB_APPLICATION_CREATED":
      return t('notifications.application_submitted');
    case "JOB_APPLICATION_STATUS_CHANGED":
      return t('notifications.application_status_updated');
    case "JOB_APPLICATION_APPROVED":
      return t('notifications.application_approved');
    case "JOB_APPLICATION_REJECTED":
      return t('notifications.application_status_updated');
    case "JOB_MATCH_CREATED":
    case "JOB_RECOMMENDATION":
      return t('notifications.job_opportunities');
    case "MESSAGE_RECEIVED":
    case "CHAT_MESSAGE":
      return t('notifications.new_message_received');
    case "INTERVIEW_SCHEDULED":
      return t('notifications.interview_scheduled');
    case "INTERVIEW_REMINDER":
      return t('notifications.interview_reminder');
    case "INTERVIEW_CANCELLED":
      return t('notifications.interview_cancelled');
    case "PROFILE_UPDATE":
      return t('notifications.profile_updated');
    case "ACCOUNT_UPDATE":
      return t('notifications.account_settings_updated');
    default:
      return title || t('notifications.new_notification');
  }
}

// Transform API notification to UI notification format
function transformNotification(apiNotification: ApiNotification, t: (key: string) => string): Notification {
  // Debug: Log API notification data to understand structure
  // Map notification types to UI types and determine priority
  const typeMapping: Record<string, { type: Notification["type"]; priority: Notification["priority"] }> = {
    // Job application notifications
    JOB_APPLICATION_CREATED: { type: "job_application", priority: "high" },
    JOB_APPLICATION_STATUS_CHANGED: { type: "job_application", priority: "high" },
    JOB_APPLICATION_APPROVED: { type: "job_application", priority: "high" },
    JOB_APPLICATION_REJECTED: { type: "job_application", priority: "medium" },
    
    // Job match notifications
    JOB_MATCH_CREATED: { type: "job_match", priority: "medium" },
    JOB_RECOMMENDATION: { type: "job_match", priority: "medium" },
    
    // Message notifications
    MESSAGE_RECEIVED: { type: "message", priority: "high" },
    CHAT_MESSAGE: { type: "message", priority: "high" },
    
    // Interview notifications
    INTERVIEW_SCHEDULED: { type: "interview", priority: "high" },
    INTERVIEW_REMINDER: { type: "interview", priority: "high" },
    INTERVIEW_CANCELLED: { type: "interview", priority: "medium" },
    
    // System notifications
    SYSTEM_NOTIFICATION: { type: "system", priority: "low" },
    PROFILE_UPDATE: { type: "system", priority: "low" },
    ACCOUNT_UPDATE: { type: "system", priority: "low" },
    
    default: { type: "system", priority: "medium" },
  };

  const mapping = typeMapping[apiNotification.event.type] || typeMapping.default;
  
  
  // Determine action URL based on notification type and related object
  let actionUrl: string | undefined;
  switch (apiNotification.event.type) {
    case "JOB_APPLICATION_CREATED":
    case "JOB_APPLICATION_STATUS_CHANGED":
    case "JOB_APPLICATION_APPROVED":
    case "JOB_APPLICATION_REJECTED":
      actionUrl = "/applications";
      break;
    case "MESSAGE_RECEIVED":
    case "CHAT_MESSAGE":
      actionUrl = "/chat";
      break;
    case "JOB_MATCH_CREATED":
    case "JOB_RECOMMENDATION":
      actionUrl = "/jobs";
      break;
    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_REMINDER":
    case "INTERVIEW_CANCELLED":
      actionUrl = "/applications"; // Interview details usually in applications
      break;
    case "PROFILE_UPDATE":
    case "ACCOUNT_UPDATE":
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
    description: generateNotificationDescription(apiNotification, t),
    isRead: apiNotification.is_read,
    createdAt,
    actionUrl,
    priority: mapping.priority,
    eventType: apiNotification.event.type, // Preserve original event type
  };
}

function NotificationIcon({ type, eventType }: { type: Notification["type"]; eventType?: string }) {
  // More specific icons based on event type
  if (eventType) {
    switch (eventType) {
      case "JOB_APPLICATION_APPROVED":
        return <ThumbsUp className="w-4 h-4" />;
      case "JOB_APPLICATION_REJECTED":
        return <ThumbsDown className="w-4 h-4" />;
      case "INTERVIEW_SCHEDULED":
        return <Calendar className="w-4 h-4" />;
      case "INTERVIEW_CANCELLED":
        return <CalendarX className="w-4 h-4" />;
      case "JOB_RECOMMENDATION":
      case "JOB_MATCH_CREATED":
        return <Sparkles className="w-4 h-4" />;
      case "PROFILE_UPDATE":
        return <User className="w-4 h-4" />;
      case "ACCOUNT_UPDATE":
        return <Settings className="w-4 h-4" />;
    }
  }
  
  // Fallback to type-based icons
  switch (type) {
    case "job_application":
      return <BriefcaseIcon className="w-4 h-4" />;
    case "message":
      return <MessageCircle className="w-4 h-4" />;
    case "job_match":
      return <Sparkles className="w-4 h-4" />;
    case "interview":
      return <Calendar className="w-4 h-4" />;
    case "system":
      return <Settings className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function NotificationCard({
  notification,
  onMarkAsRead,
  eventType,
  t,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  eventType?: string;
  t: (key: string) => string;
}) {
  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  
  const typeColors = {
    job_application: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    message: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    job_match: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    interview: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    system: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the mark as read button
    if ((e.target as Element).closest('button[data-action="mark-read"]')) {
      return;
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onMarkAsRead(notification.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
        notification.actionUrl ? 'cursor-pointer' : ''
      } ${
        !notification.isRead
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/50 shadow-sm"
          : "bg-card border-border hover:border-input"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            !notification.isRead
              ? typeColors[notification.type] + " shadow-sm"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <NotificationIcon type={notification.type} eventType={eventType} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-semibold leading-tight text-sm ${
                  !notification.isRead
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {notification.title}
              </h3>
              {!notification.isRead && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              <Badge
                variant="secondary"
                className={`text-xs font-medium px-1.5 py-0.5 ${typeColors[notification.type]}`}
              >
                {notification.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground dark:text-muted-foreground/60 mb-2 leading-snug">
            {notification.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">
              {notification.createdAt && !isNaN(notification.createdAt.getTime()) 
                ? formatDistanceToNow(notification.createdAt, { addSuffix: true })
                : t('notifications.unknown_time')}
            </span>

            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                data-action="mark-read"
                className="text-xs px-2 py-1 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
              >
                {t('notifications.mark_read')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
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
        title: t('common.success'),
        description: t('notifications.mark_read'),
      });
    },
    onError: (error: any) => {
      console.error("Mark as read error:", error);
      toast({
        title: t('common.error'),
        description: t('notifications.failed_mark_read'),
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
      return { message: t('notifications.all_marked_read') };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: t('common.success'),
        description: t('notifications.mark_all_read'),
      });
    },
    onError: (error: any) => {
      console.error("Mark all as read error:", error);
      toast({
        title: t('common.error'),
        description: t('notifications.failed_mark_all_read'),
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
  const notifications = notificationsData?.results.map(notification => transformNotification(notification, t)) || [];

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
                  {t('notifications.mark_all_read')}...
                </>
              ) : (
                t('notifications.mark_all_read')
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
                    {t('notifications.notifications_coming_soon')}
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground/60 mb-6 leading-relaxed">
                    {t('notifications.notifications_setup_message')}
                  </p>
                  <div className="bg-white dark:bg-background rounded-xl p-6 text-left border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-foreground dark:text-muted-foreground/60 mb-3">{t('notifications.in_the_meantime')}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground/60">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {t('notifications.check_applications')}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {t('notifications.visit_chat')}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {t('notifications.browse_jobs')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground/60 dark:text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-foreground dark:text-gray-100 mb-3">
                  {t('notifications.no_notifications')}
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground/60">
                  {activeTab === "unread"
                    ? t('notifications.all_caught_up')
                    : activeTab === "read"
                      ? t('notifications.no_read_notifications')
                      : t('notifications.no_notifications_yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    eventType={notification.eventType}
                    t={t}
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
