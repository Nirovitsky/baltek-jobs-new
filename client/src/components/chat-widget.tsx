import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { ChatRoom } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Building,
  Clock
} from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: chatRooms, isLoading, error } = useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => ApiClient.getChatRooms(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
        {(chatRooms as any)?.results?.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {(chatRooms as any)?.results?.length}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-40">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-background/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Failed to load conversations</p>
                <p className="text-xs">Please try again later</p>
              </div>
            ) : (chatRooms as any)?.results?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Start applying to jobs to chat with employers</p>
              </div>
            ) : (
              (chatRooms as any)?.results?.map((room: ChatRoom) => (
                <div
                  key={room.id}
                  className="p-3 border-b hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {room.name}
                      </p>
                      {room.last_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          {room.last_message.content}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {room.updated_at && (
                        <div className="flex items-center text-xs text-muted-foreground/60">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(room.updated_at)}
                        </div>
                      )}
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
