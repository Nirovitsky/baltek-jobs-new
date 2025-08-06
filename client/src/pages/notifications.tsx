import { useState } from "react";
import { Bell, BriefcaseIcon, MessageCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'job_application' | 'message' | 'job_match' | 'interview' | 'system';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'job_application',
    title: 'Application Status Update',
    description: 'Your application for Senior Frontend Developer at TechCorp has been reviewed.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionUrl: '/applications',
    priority: 'high'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Recruiter',
    description: 'Sarah Johnson from InnovateLab sent you a message about the React Developer position.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionUrl: '/chat',
    priority: 'high'
  },
  {
    id: '3',
    type: 'job_match',
    title: 'New Job Match',
    description: 'We found 3 new jobs that match your profile and preferences.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    actionUrl: '/',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'interview',
    title: 'Interview Scheduled',
    description: 'Your interview with DataDriven Inc is scheduled for tomorrow at 2:00 PM.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    priority: 'high'
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Update Required',
    description: 'Please update your profile to increase your visibility to recruiters.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionUrl: '/profile',
    priority: 'low'
  },
  {
    id: '6',
    type: 'job_application',
    title: 'Application Submitted',
    description: 'Your application for Full Stack Developer at StartupXYZ has been successfully submitted.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    actionUrl: '/applications',
    priority: 'medium'
  }
];

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'job_application':
      return <BriefcaseIcon className="w-4 h-4" />;
    case 'message':
      return <MessageCircle className="w-4 h-4" />;
    case 'job_match':
      return <CheckCircle className="w-4 h-4" />;
    case 'interview':
      return <Clock className="w-4 h-4" />;
    case 'system':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function NotificationCard({ notification, onMarkAsRead }: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <Card className={`mb-3 transition-all hover:shadow-md ${
      !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              !notification.isRead ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              <NotificationIcon type={notification.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${
                  !notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                }`}>
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
                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
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
                      onClick={() => window.location.href = notification.actionUrl!}
                      className="text-xs px-2 py-1"
                    >
                      View
                    </Button>
                  )}
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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "read") return notification.isRead;
    return true; // "all" tab
  });

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="text-sm"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your job applications, messages, and platform updates.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredNotifications.length === 0 ? (
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
                      : "You don't have any notifications yet."
                    }
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