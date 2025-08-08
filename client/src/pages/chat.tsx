import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  Building2, 
  Phone, 
  Mail,
  MoreVertical,
  Plus,
  Clock,
  Check,
  CheckCheck,
  Users,
  Briefcase
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  recipient: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  name?: string; // Company name or participant name
  participant: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
    role?: string;
    company?: string;
  };
  last_message: {
    content: string;
    created_at?: string;
  } | null;
  unread_count: number;
  updated_at: string;
  is_expired?: boolean;
  is_active?: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms only once
  const { data: chatRooms, isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => ApiClient.getChatRooms(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch messages for selected room
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['chat', 'messages', selectedConversation],
    queryFn: () => ApiClient.getChatMessages(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Poll more frequently for active conversation
    retry: 2,
    retryDelay: 1000,
  });

  // WebSocket connection
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      if (!selectedConversation) {
        throw new Error('No conversation selected');
      }
      return ApiClient.sendMessage(selectedConversation, data.content);
    },
    onSuccess: () => {
      setMessageInput("");
      // Only invalidate messages, not rooms
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedConversation] });
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

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
      console.error('Mark as read error:', error);
      // Silent error - don't show toast for this
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return; // Don't connect if user is not authenticated
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setSocket(ws);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
              // Invalidate queries to refresh message list
              queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
              queryClient.invalidateQueries({ queryKey: ['chat', 'messages', data.conversation_id] });
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setSocket(null);
          
          // Attempt to reconnect after 3 seconds if not a manual disconnect
          if (event.code !== 1000) {
            reconnectTimeout = setTimeout(() => {
              console.log('Attempting to reconnect WebSocket...');
              connectWebSocket();
            }, 3000);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
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
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [user?.id, queryClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
      
      // Join conversation room via WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: 'join_conversation',
          conversation_id: selectedConversation
        }));
      }
    }
  }, [selectedConversation, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      content: messageInput.trim(),
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = roomsLoading || roomsError ? [] : ((chatRooms as any)?.results || []).filter((conversation: Conversation) => {
    if (!conversation || !conversation.id) return false;
    
    const conversationName = conversation.name?.toLowerCase() || '';
    const participantName = conversation.participant ? 
      `${conversation.participant.first_name || ''} ${conversation.participant.last_name || ''}`.toLowerCase().trim() : '';
    const company = conversation.participant?.company?.toLowerCase() || '';
    const role = conversation.participant?.role?.toLowerCase() || '';
    
    const query = searchQuery.toLowerCase();
    return conversationName.includes(query) || 
           participantName.includes(query) || 
           company.includes(query) ||
           role.includes(query);
  });

  const selectedConversationData = filteredConversations.find((c: Conversation) => c.id === selectedConversation);

  // Use actual messages data from API
  const messagesData = (messages as any) || { results: [] };

  // Add error state handling
  if (roomsError && !roomsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load conversations
          </h3>
          <p className="text-gray-600 mb-4">
            {roomsError instanceof Error ? roomsError.message : "Something went wrong"}
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="chat-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
        <p className="text-gray-600">Connect with recruiters and hiring managers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-new-message">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      New conversations are typically started when recruiters contact you about job opportunities, 
                      or when you apply to positions through the platform.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">When recruiters contact you about opportunities, your conversations will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        markAsReadMutation.mutate(conversation.id);
                      }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? 'bg-primary/10 border-r-4 border-primary' : ''
                      } ${conversation.is_expired ? 'opacity-60' : ''}`}
                      data-testid={`conversation-${conversation.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.participant?.avatar} />
                            <AvatarFallback>
                              {conversation.name?.[0]?.toUpperCase() || conversation.participant?.first_name?.[0] || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread_count > 0 && !conversation.is_expired && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {conversation.name || conversation.participant?.first_name || 'Unknown Conversation'}
                              </h3>
                              {conversation.is_expired && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  Expired
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.last_message?.created_at || conversation.updated_at)}
                            </span>
                          </div>
                          

                          
                          {conversation.last_message ? (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No messages yet</p>
                          )}
                        </div>
                      </div>
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
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversationData?.participant?.avatar} />
                      <AvatarFallback>
                        {selectedConversationData?.name?.[0]?.toUpperCase() || selectedConversationData?.participant?.first_name?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversationData?.name || selectedConversationData?.participant?.first_name || 'Unknown Conversation'}
                        </h3>
                        {selectedConversationData?.is_expired && (
                          <Badge variant="secondary" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>

                      {selectedConversationData?.is_expired && (
                        <p className="text-xs text-yellow-600 mt-1">
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
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex items-end space-x-2 max-w-xs">
                            {i % 2 !== 0 && <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />}
                            <div className="bg-gray-200 rounded-lg p-3 animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-24" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messagesData?.results?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messagesData?.results?.filter((message: Message) => message && message.id && message.sender)
                        .map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                            message.sender?.id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            {message.sender?.id !== user?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.sender?.avatar} />
                                <AvatarFallback>
                                  {message.sender?.first_name?.[0] || ''}{message.sender?.last_name?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`rounded-lg p-3 ${
                              message.sender?.id === user?.id
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className={`text-xs ${
                                  message.sender?.id === user?.id ? 'text-white/70' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.created_at)}
                                </span>
                                {message.sender?.id === user?.id && (
                                  <div className="text-white/70">
                                    {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input - Only show if not expired */}
              {!selectedConversationData?.is_expired && (
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button 
                      type="submit" 
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            /* No Conversation Selected */
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}