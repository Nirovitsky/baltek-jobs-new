import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import MessageRenderer from "@/components/message-renderer";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/AttachmentsUI";
import {
  MessageCircle,
  Send,
  Search,
  User,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Users,
  Briefcase,
  Paperclip,
  X,
  FileText,
  Download,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface Message {
  id: number | string;
  room: number;
  owner: number;
  text: string;
  status: "sending" | "delivered" | "failed" | "read";
  attachments: any[];
  date_created: number;
  isOptimistic?: boolean;
  error?: string;
}

interface Conversation {
  id: number;
  content_type: string;
  object_id: number;
  content_object: any;
  unread_message_count: number;
  last_message_text: string | null;
  last_message_date_created: number | null;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<Array<{id: number, name: string, size: number, file_url?: string, content_type?: string}>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Array<{name: string, progress: number, abort?: () => void}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch chat rooms only once
  const {
    data: chatRooms,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => ApiClient.getChatRooms(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch messages for selected room (initial load only)
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["chat", "messages", selectedConversation],
    queryFn: () => ApiClient.getChatMessages(selectedConversation!),
    enabled: !!selectedConversation,
    retry: 2,
    retryDelay: 1000,
  });

  // Local messages state for real-time updates
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  // WebSocket connection
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // File upload no longer needs mutation - handled directly with progress

  // Send message via WebSocket with optimistic UI
  const sendMessageViaWebSocket = (content: string, attachments: number[] = []) => {
    if (!selectedConversation) {
      toast({
        title: "Error",
        description: "No conversation selected",
        variant: "destructive",
      });
      return;
    }

    // Check if conversation is expired before sending
    if (selectedConversationData?.content_object?.status === "expired") {
      toast({
        title: "Error",
        description: "This conversation has expired and is read-only",
        variant: "destructive",
      });
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast({
        title: "Error",
        description: "Not connected to chat server. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Create optimistic message immediately
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      room: selectedConversation,
      owner: user?.id || 0,
      text: content,
      status: "sending",
      attachments: attachments.map(id => {
        const file = attachedFiles.find(f => f.id === id);
        return {
          id,
          file_name: file?.name || "File",
          file_url: file?.file_url,
          content_type: file?.content_type,
          size: file?.size
        };
      }),
      date_created: Math.floor(Date.now() / 1000),
      isOptimistic: true,
    };

    // Add optimistic message to UI immediately
    setLocalMessages(prev => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 100);

    const message = {
      type: "send_message",
      data: {
        room: selectedConversation,
        text: content,
        attachments: attachments,
      },
    };

    console.log("Sending WebSocket message:", message);
    
    try {
      socket.send(JSON.stringify(message));
      setMessageInput("");
      setAttachedFiles([]);
      
      // Set a timeout to mark message as failed if no response received
      setTimeout(() => {
        setLocalMessages(prev => {
          const messageExists = prev.find(msg => msg.id === optimisticId);
          if (messageExists && messageExists.status === "sending") {
            return prev.map(msg => 
              msg.id === optimisticId 
                ? { ...msg, status: "failed" as const, error: "Message timeout - please retry" }
                : msg
            );
          }
          return prev;
        });
      }, 30000); // 30 second timeout
      
    } catch (error) {
      console.error("Failed to send message:", error);
      // Mark message as failed
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId 
            ? { ...msg, status: "failed" as const, error: "Failed to send message" }
            : msg
        )
      );
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    }
  };

  // Retry failed message
  const retryMessage = (messageId: string | number) => {
    const failedMessage = localMessages.find(msg => msg.id === messageId);
    if (!failedMessage) return;

    // Update status to sending
    setLocalMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: "sending" as const, error: undefined }
          : msg
      )
    );

    // Retry sending
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: "failed" as const, error: "Not connected to chat server" }
            : msg
        )
      );
      return;
    }

    const message = {
      type: "send_message",
      data: {
        room: selectedConversation,
        text: failedMessage.text,
        attachments: failedMessage.attachments?.map((att: any) => att.id) || [],
      },
    };

    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error("Failed to retry message:", error);
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: "failed" as const, error: "Failed to send message" }
            : msg
        )
      );
    }
  };

  // Mark conversation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      // This would be implemented when the API supports read receipts
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Don't refetch rooms, just mark as read locally if needed
    },
    onError: (error) => {
      console.error("Mark as read error:", error);
      // Silent error - don't show toast for this
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return; // Don't connect if user is not authenticated

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        // Get token for WebSocket authentication
        const token = localStorage.getItem("baltek_access_token");
        
        if (!token) {
          console.warn("No access token available for WebSocket authentication");
          return;
        }

        // Connect directly to Baltek API WebSocket with token as query parameter
        const wsUrl = `wss://api.baltek.net/ws/chat/?token=${encodeURIComponent(token)}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected successfully with token authentication");
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);

            // Add safety checks for data structure
            if (!data || !data.type) {
              console.warn("Invalid WebSocket message format:", data);
              return;
            }

            if (data.type === "message_delivered") {
              // Message was successfully sent by me - update optimistic message or add new one
              console.log("Message delivered - updating optimistic message", data);
              
              // Extract message data
              const messageData = data.message || data.data?.message || data.data;
              const roomId = data.room || data.data?.room || selectedConversation;
              
              if (roomId === selectedConversation) {
                const deliveredMessage = {
                  id: messageData?.id || data.id || Date.now(),
                  room: roomId,
                  owner: user?.id,
                  text: messageData?.text || data.text || "",
                  status: "delivered" as const,
                  attachments: messageData?.attachments || data.attachments || [],
                  date_created: messageData?.date_created || data.date_created || Math.floor(Date.now() / 1000),
                };
                
                setLocalMessages(prev => {
                  // First, try to find and update an optimistic message
                  const optimisticIndex = prev.findIndex(msg => 
                    msg.isOptimistic && 
                    msg.text === deliveredMessage.text &&
                    msg.status === "sending"
                  );
                  
                  if (optimisticIndex !== -1) {
                    // Update the optimistic message with real data
                    const updated = [...prev];
                    updated[optimisticIndex] = {
                      ...deliveredMessage,
                      isOptimistic: false,
                    };
                    return updated;
                  } else {
                    // No optimistic message found, add as new (shouldn't happen but safety)
                    const exists = prev.some(msg => msg.id === deliveredMessage.id);
                    if (!exists) {
                      return [...prev, deliveredMessage];
                    }
                    return prev;
                  }
                });
                setTimeout(scrollToBottom, 100);
              }
            } else if (data.type === "receive_message") {
              // Received a message from someone else - add it to local state as their message
              console.log("Message received - adding as other person's message");
              
              // Extract message data - could be in data.message or data directly
              const messageData = data.message || data.data?.message || data.data;
              const roomId = data.room || data.data?.room || selectedConversation;
              
              if (roomId === selectedConversation && messageData) {
                const formattedMessage = {
                  id: messageData.id || Date.now(),
                  room: roomId,
                  owner: messageData.owner || messageData.sender_id, // This message is from them
                  text: messageData.text || messageData.content || data.text || "",
                  status: messageData.status || "delivered",
                  attachments: messageData.attachments || data.attachments || [],
                  date_created: messageData.date_created || Math.floor(Date.now() / 1000),
                };
                
                console.log("Adding received message to UI:", formattedMessage);
                
                setLocalMessages(prev => {
                  // Check if message already exists to avoid duplicates
                  const exists = prev.some(msg => msg.id === formattedMessage.id);
                  if (!exists) {
                    return [...prev, formattedMessage];
                  }
                  return prev;
                });
                // Scroll to bottom after adding message
                setTimeout(scrollToBottom, 100);
              }

              // Only refresh rooms to update last message info
              queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
            } else if (data.type === "message_error") {
              // Handle message send error - mark optimistic message as failed
              console.log("Message error - marking optimistic message as failed", data);
              const errorMsg = data.data?.error || data.error || "Unknown error occurred";
              
              // Find and update the most recent sending message
              setLocalMessages(prev => {
                const sendingIndex = prev.findLastIndex(msg => 
                  msg.isOptimistic && msg.status === "sending"
                );
                
                if (sendingIndex !== -1) {
                  const updated = [...prev];
                  updated[sendingIndex] = {
                    ...updated[sendingIndex],
                    status: "failed" as const,
                    error: errorMsg,
                  };
                  return updated;
                }
                return prev;
              });
              
              toast({
                title: "Failed to send message",
                description: errorMsg,
                variant: "destructive",
              });
            } else if (data.type === "auth_success") {
              console.log("WebSocket authentication successful");
            } else {
              console.log("Unknown WebSocket message type:", data.type);
            }
          } catch (error) {
            console.error("WebSocket message error:", error);
            console.error("Raw message data:", event.data);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          setSocket(null);

          // Only attempt to reconnect for certain error codes and if we have a token
          const hasToken = !!localStorage.getItem("baltek_access_token");
          const shouldReconnect = hasToken && event.code !== 1000 && event.code !== 1008; // Don't reconnect on authentication failures (1008)
          
          if (shouldReconnect) {
            reconnectTimeout = setTimeout(() => {
              console.log("Attempting to reconnect WebSocket...");
              connectWebSocket();
            }, 5000); // Increase delay to reduce server load
          } else {
            console.log("WebSocket connection stopped:", hasToken ? "Authentication failed" : "No token");
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        // Retry connection after 5 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [user?.id, queryClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, localMessages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);

      // Join conversation room via WebSocket
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "join_conversation",
            conversation_id: selectedConversation,
          }),
        );
      }
    }
  }, [selectedConversation, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && attachedFiles.length === 0) || !selectedConversation) return;

    const attachmentIds = attachedFiles.map(file => file.id);
    sendMessageViaWebSocket(messageInput.trim() || "", attachmentIds);
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    
    // Initialize progress tracking
    const fileNames = Array.from(files).map(file => file.name);
    setUploadProgress(fileNames.map(name => ({ name, progress: 0 })));
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          // Upload with real-time progress callback and cancellation support
          const upload = ApiClient.uploadFile(file, (progress) => {
            setUploadProgress(prev => 
              prev.map((item, idx) => 
                idx === index ? { ...item, progress } : item
              )
            );
          });
          
          // Store abort function for cancellation
          setUploadProgress(prev => 
            prev.map((item, idx) => 
              idx === index ? { ...item, abort: upload.abort } : item
            )
          );
          
          const result = await upload.promise;
          console.log("Upload result:", result); // Debug: see what the API returns

          return {
            id: (result as any).id,
            name: file.name,
            size: file.size,
            file_url: (result as any).file_url || (result as any).url || (result as any).path, // Try different possible URL fields
            content_type: file.type,
          };
        } catch (error) {
          console.error("Upload error:", error);
          
          // Check if it was aborted
          if (error instanceof Error && error.message === 'Upload aborted') {
            // Remove from progress tracking for aborted uploads
            setUploadProgress(prev => prev.filter((_, idx) => idx !== index));
            return null;
          }
          
          // Update progress to show error
          setUploadProgress(prev => 
            prev.map((item, idx) => 
              idx === index ? { ...item, progress: -1, abort: undefined } : item
            )
          );
          
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter(Boolean) as Array<{id: number, name: string, size: number, file_url?: string, content_type?: string}>;
      
      setAttachedFiles(prev => [...prev, ...successfulUploads]);
      
      if (successfulUploads.length > 0) {
        toast({
          title: "Files Uploaded",
          description: `${successfulUploads.length} file(s) attached successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
      setUploadProgress([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove attached file
  const removeAttachedFile = (fileId: number) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Cancel upload
  const cancelUpload = (index: number) => {
    setUploadProgress(prev => {
      const item = prev[index];
      if (item?.abort) {
        item.abort();
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Use chat rooms data exactly as provided by the API
  const conversations = roomsLoading || roomsError ? [] : ((chatRooms as any)?.results || []);

  const selectedConversationData = conversations.find(
    (c: Conversation) => c.id === selectedConversation,
  );

  // Reset local messages when conversation changes
  useEffect(() => {
    setLocalMessages([]);
  }, [selectedConversation]);

  // Combine API messages with local real-time messages
  const apiMessages = (messages as any)?.results || [];
  const allMessages = [...apiMessages, ...localMessages];
  
  // Remove duplicate messages based on ID to avoid showing messages multiple times
  const uniqueMessages = allMessages.filter((msg, index, self) => 
    msg && msg.id && self.findIndex(m => m && m.id === msg.id) === index
  );
  
  // Sort messages by date_created (oldest first, newest at bottom)
  const sortedMessages = uniqueMessages.sort((a, b) => {
    const timeA = a.date_created || 0;
    const timeB = b.date_created || 0;
    return timeA - timeB; // Ascending order (oldest first)
  });
  
  const messagesData = { results: sortedMessages };
  
  // Debug logging
  console.log("Messages debug:", {
    selectedConversation,
    apiMessagesCount: apiMessages.length,
    localMessagesCount: localMessages.length,
    totalUniqueMessages: uniqueMessages.length,
    messagesLoading,
    messagesError: messagesError ? messagesError.message : null,
    sampleMessage: uniqueMessages[0] || null
  });

  // Add error state handling
  if (roomsError && !roomsLoading) {
    return (
      <div>
        <BreadcrumbNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Unable to load conversations
            </h3>
            <p className="text-muted-foreground mb-4">
              {roomsError instanceof Error
                ? roomsError.message
                : "Something went wrong"}
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] })
              }
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4" data-testid="chat-page">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-340px)]">
                {roomsLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                    <p className="font-medium mb-2">No conversations yet</p>
                    <p className="text-sm">
                      When recruiters contact you about opportunities, your
                      conversations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {conversations.map((conversation: Conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation.id);
                          markAsReadMutation.mutate(conversation.id);
                        }}
                        className={`relative p-4 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-sm transform hover:scale-[1.01] ${
                          selectedConversation === conversation.id
                            ? "bg-primary/10 shadow-sm scale-[1.01]"
                            : "hover:bg-muted"
                        } ${conversation.content_object?.status === "expired" ? "opacity-70" : ""}`}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-14 h-14 ring-2 ring-background shadow-sm">
                              <AvatarImage
                                src={conversation.content_object?.job?.organization?.logo}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold text-lg">
                                {conversation.content_object?.job?.organization?.display_name?.[0] ||
                                  conversation.content_object?.job?.organization?.official_name?.[0] ||
                                  "C"}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unread_message_count > 0 && (
                              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-background shadow-md animate-pulse">
                                {conversation.unread_message_count > 99 ? "99+" : conversation.unread_message_count}
                              </Badge>
                            )}
                            {conversation.unread_message_count === 0 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <h3 className={`font-semibold text-base leading-5 ${
                                  conversation.unread_message_count > 0
                                    ? "text-foreground"
                                    : "text-foreground"
                                } break-words`}>
                                  {(conversation.content_object?.job?.organization?.display_name || 
                                    conversation.content_object?.job?.organization?.official_name || "Unknown Company") + 
                                   (conversation.content_object?.job?.title ? ` - ${conversation.content_object.job.title}` : "")}
                                </h3>
                                {conversation.content_object?.status === "expired" && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800 font-medium flex-shrink-0"
                                  >
                                    Expired
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">
                                {conversation.last_message_date_created 
                                  ? formatTime(new Date(conversation.last_message_date_created * 1000).toISOString())
                                  : "Recently"}
                              </span>
                            </div>

                            {/* Last message */}
                            <div className="flex items-center">
                              {conversation.last_message_text ? (
                                <p className={`text-sm truncate flex-1 leading-5 ${
                                  conversation.unread_message_count > 0
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                                }`}>
                                  {conversation.last_message_text}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground/60 italic flex-1">
                                  Start the conversation
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Active conversation indicator */}
                        {selectedConversation === conversation.id && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-primary/100 rounded-l-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => {
                          const orgId = selectedConversationData?.content_object?.job?.organization?.id;
                          if (orgId) {
                            navigate(`/company/${orgId}`);
                          }
                        }}
                      >
                        <AvatarImage
                          src={selectedConversationData?.content_object?.job?.organization?.logo}
                        />
                        <AvatarFallback>
                          {selectedConversationData?.content_object?.job?.organization?.display_name?.[0] ||
                            selectedConversationData?.content_object?.job?.organization?.official_name?.[0] ||
                            "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 
                            className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              const orgId = selectedConversationData?.content_object?.job?.organization?.id;
                              if (orgId) {
                                navigate(`/company/${orgId}`);
                              }
                            }}
                          >
                            {(selectedConversationData?.content_object?.job?.organization?.display_name || 
                              selectedConversationData?.content_object?.job?.organization?.official_name || "Unknown Company") + 
                             (selectedConversationData?.content_object?.job?.title ? ` - ${selectedConversationData?.content_object?.job?.title}` : "")}
                          </h3>
                          {selectedConversationData?.content_object?.status === "expired" && (
                            <Badge variant="secondary" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>

                        {selectedConversationData?.content_object?.status === "expired" && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            This conversation has expired and is now read-only.
                          </p>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-400px)] p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex items-end space-x-2 max-w-xs">
                              {i % 2 !== 0 && (
                                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                              )}
                              <div className="bg-muted rounded-lg p-3 animate-pulse">
                                <div className="h-4 bg-muted rounded w-24" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messagesData?.results?.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                          <p>Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messagesData?.results
                          ?.filter(
                            (message: Message) =>
                              message && message.id && (message.text || (message.attachments && message.attachments.length > 0)),
                          )
                          .map((message: Message) => {
                            const hasAttachments = message.attachments && message.attachments.length > 0;
                            const hasText = message.text && message.text.trim();
                            
                            // Function to create avatar component
                            const renderAvatar = () => (
                              message.owner !== user?.id && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="" />
                                  <AvatarFallback>
                                    {selectedConversationData?.content_object?.job?.organization?.display_name?.[0] ||
                                      selectedConversationData?.content_object?.job?.organization?.official_name?.[0] ||
                                      "R"}
                                  </AvatarFallback>
                                </Avatar>
                              )
                            );

                            // Function to create message metadata
                            const renderMessageMetadata = () => (
                              <div className="flex items-center justify-end gap-1 mt-2">
                                {message.status === "failed" && message.error && (
                                  <span className="text-xs text-red-400 mr-2">
                                    {message.error}
                                  </span>
                                )}
                                
                                <span
                                  className={`text-xs ${
                                    message.owner === user?.id
                                      ? "text-white/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatTime(new Date(message.date_created * 1000).toISOString())}
                                </span>
                                
                                {message.owner === user?.id && (
                                  <div className="flex items-center gap-1">
                                    {message.status === "sending" ? (
                                      <Loader2 className="w-3 h-3 text-white/70 animate-spin" />
                                    ) : message.status === "failed" ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                                        onClick={() => retryMessage(message.id)}
                                        title="Retry message"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </Button>
                                    ) : message.status === "read" ? (
                                      <CheckCheck className="w-3 h-3 text-white/70" />
                                    ) : (
                                      <Check className="w-3 h-3 text-white/70" />
                                    )}
                                  </div>
                                )}
                              </div>
                            );

                            return (
                              <div key={message.id} className="space-y-2">
                                {/* Render attachments as separate message bubble if present */}
                                {hasAttachments && (
                                  <div className={`flex ${message.owner === user?.id ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
                                    <div
                                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                                        message.owner === user?.id
                                          ? "flex-row-reverse space-x-reverse"
                                          : ""
                                      }`}
                                    >
                                      {renderAvatar()}
                                      <div className="rounded-lg transition-all duration-200 ease-in-out hover:shadow-md">
                                        <UserMessageAttachments
                                          attachments={message.attachments}
                                          isOwner={message.owner === user?.id}
                                        />
                                        {!hasText && renderMessageMetadata()}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Render text as separate message bubble if present */}
                                {hasText && (
                                  <div className={`flex ${message.owner === user?.id ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
                                    <div
                                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                                        message.owner === user?.id
                                          ? "flex-row-reverse space-x-reverse"
                                          : ""
                                      }`}
                                    >
                                      {!hasAttachments && renderAvatar()}
                                      <div className={`max-w-xs rounded-lg px-3 py-2 ${
                                        message.status === "failed"
                                          ? "bg-red-500 text-white"
                                          : message.status === "sending"
                                          ? "bg-primary/70 text-primary-foreground"
                                          : message.owner === user?.id
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                                      }`}>
                                        <p>
                                          <MessageRenderer 
                                            text={message.text} 
                                          />
                                        </p>
                                        <span className={`text-xs ${
                                          message.owner === user?.id || message.status === "failed" || message.status === "sending" 
                                            ? "text-gray-300" 
                                            : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                          {renderMessageMetadata()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                {/* Message Input - Only show if not expired */}
                {selectedConversationData?.content_object?.status !== "expired" ? (
                  <div className="p-4 border-t">
                    {/* File Attachments and Upload Progress */}
                    <ComposerAttachments
                      attachedFiles={attachedFiles}
                      uploadProgress={uploadProgress}
                      onRemoveFile={removeAttachedFile}
                      onCancelUpload={cancelUpload}
                      uploadingFiles={uploadingFiles}
                    />
                    
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2"
                    >
                      <ComposerAddAttachment
                        onFileSelect={handleFileUpload}
                        uploadingFiles={uploadingFiles}
                        fileInputRef={fileInputRef}
                      />
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        data-testid="input-message"
                      />
                      <Button
                        type="submit"
                        disabled={
                          (!messageInput.trim() && attachedFiles.length === 0) ||
                          !socket ||
                          socket.readyState !== WebSocket.OPEN ||
                          uploadingFiles
                        }
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 border-t bg-muted">
                    <div className="flex items-center justify-center py-3">
                      <div className="text-center text-muted-foreground">
                        <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground/60" />
                        <p className="text-sm font-medium">
                          Conversation Expired
                        </p>
                        <p className="text-xs">
                          This conversation is now read-only
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No Conversation Selected */
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
                  <h3 className="font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
