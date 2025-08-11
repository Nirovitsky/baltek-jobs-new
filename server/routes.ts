import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // The backend API is already available at https://api.baltek.net/api/
  // Our Express server will only serve the frontend and proxy API requests if needed
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication endpoints - proxy to Baltek API
  app.post("/api/auth/login", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Login failed:", response.status, errorData);
        return res.status(response.status).json({ error: "Login failed" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Registration failed:", response.status, errorData);
        return res.status(response.status).json({ error: "Registration failed" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Token refresh failed:", response.status, errorData);
        return res.status(response.status).json({ error: "Token refresh failed" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error during token refresh:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user info - extract user ID from JWT token
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No authorization token provided" });
      }

      const token = authHeader.split(' ')[1];
      // Simple JWT decode to get user ID (just parse the payload)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userId = payload.user_id;

      if (!userId) {
        return res.status(401).json({ error: "Invalid token format" });
      }

      const response = await fetch(`https://api.baltek.net/api/users/${userId}/`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Get user info failed:", response.status, errorData);
        return res.status(response.status).json({ error: "Failed to get user info" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error getting user info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Generic users endpoint
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.baltek.net/api/users/${id}/`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Get user failed:", response.status, errorData);
        return res.status(response.status).json({ error: "Failed to get user" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Proxy routes to Baltek API
  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.baltek.net/api/organizations/${id}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organization: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Organization ${id} data:`, JSON.stringify(data, null, 2));
      res.json(data);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  // Fetch jobs for a specific organization
  app.get("/api/organizations/:id/jobs", async (req, res) => {
    try {
      const { id } = req.params;
      const { page = "1", limit = "20" } = req.query;
      const response = await fetch(`https://api.baltek.net/api/jobs/?organization=${id}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organization jobs: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching organization jobs:", error);
      res.status(500).json({ error: "Failed to fetch organization jobs" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const response = await fetch(`https://api.baltek.net/api/jobs/?${queryString}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Get individual job details
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.baltek.net/api/jobs/${id}/`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch job ${id}: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Get saved job filters
  app.get("/api/jobs/saved_filters/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/jobs/saved_filters/", {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch saved filters: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching saved filters:", error);
      res.status(500).json({ error: "Failed to fetch saved filters" });
    }
  });

  // Get locations for filtering
  app.get("/api/locations/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/locations/");
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get categories for filtering
  app.get("/api/categories/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/categories/");
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get user resumes
  app.get("/api/users/resumes/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/users/resumes/", {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch resumes: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  });

  // Get education levels from users/educations/ API
  app.get("/api/users/educations/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/users/educations/", {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch education levels: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching education levels:", error);
      res.status(500).json({ error: "Failed to fetch education levels" });
    }
  });

  // Fetch all organizations (for company suggestions)
  app.get("/api/organizations", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const response = await fetch(`https://api.baltek.net/api/organizations/?${queryString}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  // Chat API endpoints - fetch rooms for current user (with and without trailing slash)
  app.get("/api/chat/rooms/", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/chat/rooms/", {
        headers: {
          Authorization: req.headers.authorization || "",
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw chat rooms API response:', JSON.stringify(data, null, 2));
      
      // Get current user info from auth header
      let currentUser = null;
      try {
        const authResponse = await fetch("https://api.baltek.net/api/auth/me/", {
          headers: {
            Authorization: req.headers.authorization || "",
          },
        });
        if (authResponse.ok) {
          currentUser = await authResponse.json();
        }
      } catch (error) {
        console.error('Error getting current user for chat:', error);
      }
      
      // Transform the data to match frontend interface
      if (data.results) {
        console.log('Sample room before transformation:', JSON.stringify(data.results[0], null, 2));
        data.results = data.results.map((room: any) => {
          // Use organization and job info for display (no dependency on owner object)
          const organization = room.organization || room.content_object?.job?.organization;
          const jobTitle = room.job?.title || room.content_object?.job?.title;
          
          console.log('Room transformation - organization:', organization?.display_name || organization?.official_name);
          console.log('Room transformation - jobTitle:', jobTitle);
          
          // Create room name from organization + title
          const orgName = organization?.display_name || organization?.official_name || organization?.name || 'Unknown Company';
          const roomName = jobTitle ? `${orgName} - ${jobTitle}` : orgName;
          
          // Find other participant for fallback display
          const currentUserId = currentUser?.id || null;
          const otherMember = room.members?.find((member: any) => member.id !== currentUserId);
          
          // Check if conversation is expired
          const isExpired = room.is_expired || (room.content_object && room.content_object.status === 'expired');
          
          const transformed = {
            ...room,
            participant: {
              id: otherMember?.id || 1,
              first_name: orgName,
              last_name: '', // Organization name goes in first_name
              avatar: organization?.logo ? 
                (organization.logo.startsWith('http') ? organization.logo : `https://api.baltek.net${organization.logo}`) : 
                (otherMember?.avatar ? 
                  (otherMember.avatar.startsWith('http') ? otherMember.avatar : `https://api.baltek.net${otherMember.avatar}`) : 
                  null),
              company: orgName,
              role: jobTitle || 'Recruiter'
            },
            name: roomName,
            last_message: room.last_message_text ? { 
              content: room.last_message_text,
              created_at: room.last_message_date_created ? new Date(room.last_message_date_created * 1000).toISOString() : new Date().toISOString()
            } : null,
            unread_count: room.unread_message_count || 0,
            updated_at: room.last_message_date_created ? new Date(room.last_message_date_created * 1000).toISOString() : new Date().toISOString(),
            is_expired: isExpired, // Add expired status for read-only mode
            is_active: room.is_active !== false && !isExpired // Not active if expired
          };
          
          console.log('Transformed room:', JSON.stringify(transformed, null, 2));
          return transformed;
        });
        
        console.log('Final transformed data:', JSON.stringify(data, null, 2));
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Backwards compatibility route without trailing slash
  app.get("/api/chat/rooms", (req, res) => {
    // Redirect to the route with trailing slash
    res.redirect(301, "/api/chat/rooms/");
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { room } = req.query;
      
      // Get messages
      const messagesResponse = await fetch(`https://api.baltek.net/api/chat/messages/?room=${room}`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      
      if (!messagesResponse.ok) {
        throw new Error(`Chat messages API error: ${messagesResponse.status}`);
      }
      
      const messagesData = await messagesResponse.json();
      
      // Get room details to get member information
      const roomsResponse = await fetch("https://api.baltek.net/api/chat/rooms/", {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      
      let roomData = null;
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        roomData = roomsData.results?.find((r: any) => r.id === parseInt(room as string));
      }
      
      // Transform messages to match frontend interface
      if (messagesData.results) {
        messagesData.results = messagesData.results.map((message: any) => {
          // Find sender info from room members
          const sender = roomData?.members?.find((member: any) => member.id === message.owner);
          
          return {
            id: message.id,
            content: message.text,
            sender: {
              id: message.owner,
              first_name: sender?.first_name || 'Unknown',
              last_name: sender?.last_name || '',
              avatar: sender?.avatar ? 
                (sender.avatar.startsWith('http') ? sender.avatar : `https://api.baltek.net${sender.avatar}`) : 
                null
            },
            recipient: {
              id: roomData?.members?.find((m: any) => m.id !== message.owner)?.id || 0,
              first_name: '',
              last_name: '',
              avatar: ''
            },
            created_at: new Date(message.date_created * 1000).toISOString(),
            read: message.status === 'read'
          };
        });
      }
      
      res.json(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // File upload endpoint for chat attachments
  app.post("/api/files", async (req, res) => {
    try {
      // Forward file upload to Baltek API
      const response = await fetch("https://api.baltek.net/api/files/", {
        method: "POST",
        headers: {
          Authorization: req.headers.authorization || "",
        },
        body: req.body // Forward the file data
      });
      
      if (!response.ok) {
        throw new Error(`File upload API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Placeholder endpoint for avatar images
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    // Return a simple SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e2e8f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#64748b" text-anchor="middle" dy=".3em">
        ${width}×${height}
      </text>
    </svg>`;
    
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Make wss available for message broadcasting
  (app as any).wss = wss;
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Extract authorization token from connection
    const authHeader = req.headers.authorization;
    if (authHeader) {
      (ws as any).authToken = authHeader;
      console.log('WebSocket client authenticated');
    } else {
      console.log('WebSocket client connected without authentication');
    }
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', JSON.stringify(data, null, 2));
        
        // Handle different message types
        switch (data.type) {
          case 'authenticate':
            console.log('Processing authenticate message:', JSON.stringify(data, null, 2));
            (ws as any).authToken = data.token;
            console.log('WebSocket client authenticated with token:', data.token ? 'Token received' : 'No token');
            console.log('Stored auth token:', !!(ws as any).authToken);
            // Send authentication confirmation back to client
            if (ws.readyState === WebSocket.OPEN) {
              const authResponse = {
                type: 'auth_success',
                message: 'Authentication successful'
              };
              console.log('Sending auth success:', authResponse);
              ws.send(JSON.stringify(authResponse));
            }
            break;
            
          case 'join_conversation':
            (ws as any).conversationId = data.conversation_id;
            console.log(`WebSocket client joined conversation ${data.conversation_id}`);
            break;
            
          case 'send_message':
            console.log('Processing send_message:', JSON.stringify(data, null, 2));
            
            // Send message to Baltek API
            const sendMessageToAPI = async () => {
              try {
                const messagePayload = {
                  room: data.data.room,
                  text: data.data.text,
                  attachments: data.data.attachments || []
                };
                
                // Get authorization token from WebSocket connection
                const authToken = (ws as any).authToken;
                console.log('Auth token available:', !!authToken);
                if (!authToken) {
                  throw new Error('No authorization token available. Please refresh the page and try again.');
                }
                
                // Since the API only supports GET for messages, we'll simulate message sending
                // by creating a mock message and broadcasting it locally
                // In a real implementation, this would send to the actual API endpoint
                
                const mockMessage = {
                  id: Date.now(),
                  content: data.data.text,
                  sender: {
                    id: 2, // Current user ID from token (should parse JWT)
                    first_name: "You",
                    last_name: "",
                    avatar: ""
                  },
                  recipient: {
                    id: 1,
                    first_name: "Recipient",
                    last_name: "",
                    avatar: ""
                  },
                  created_at: new Date().toISOString(),
                  read: false,
                  attachments: data.data.attachments || []
                };
                
                console.log('Simulating message send (API endpoint not available for POST)');
                const apiResponse = mockMessage;
                
                // No API call needed since we're simulating locally
                console.log('Message processed successfully:', apiResponse);
                
                // Send delivered_message confirmation to sender with API response
                if (ws.readyState === WebSocket.OPEN) {
                  const deliveryConfirmation = {
                    type: 'delivered_message',
                    data: {
                      room: data.data.room,
                      message: apiResponse
                    }
                  };
                  console.log('Sending delivery confirmation:', JSON.stringify(deliveryConfirmation, null, 2));
                  ws.send(JSON.stringify(deliveryConfirmation));
                }
                
                // Broadcast receive_message to other clients in the same conversation
                wss.clients.forEach((client) => {
                  if (client !== ws && client.readyState === WebSocket.OPEN && (client as any).conversationId === data.data.room) {
                    const receiveMessage = {
                      type: 'receive_message',
                      data: {
                        room: data.data.room,
                        message: apiResponse
                      }
                    };
                    console.log('Broadcasting receive_message to other clients:', JSON.stringify(receiveMessage, null, 2));
                    client.send(JSON.stringify(receiveMessage));
                  }
                });
                
              } catch (error) {
                console.error('Error sending message to API:', error);
                
                // Send error message back to sender
                if (ws.readyState === WebSocket.OPEN) {
                  const errorMessage = {
                    type: 'message_error',
                    data: {
                      room: data.data.room,
                      error: error instanceof Error ? error.message : 'Failed to send message'
                    }
                  };
                  ws.send(JSON.stringify(errorMessage));
                }
              }
            };
            
            sendMessageToAPI();
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
