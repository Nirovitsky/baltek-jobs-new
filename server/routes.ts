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
      // Transform response to match expected format
      res.json({
        access_token: data.access,
        refresh_token: data.refresh,
        ...data
      });
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
      const response = await fetch("https://api.baltek.net/api/auth/refresh/", {
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

  app.get("/api/auth/me", async (req, res) => {
    try {
      // Extract user ID from JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userId = payload.user_id;

      // Fetch user profile from Baltek API using /users/{id}/ endpoint
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
      res.status(500).json({ error: "Failed to get user info" });
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

  // Chat API endpoints - fetch rooms for current user
  app.get("/api/chat/rooms", async (req, res) => {
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
      
      // Transform the data to match frontend expectations
      if (data.results) {
        data.results = data.results.map((room: any) => {
          // Find the other participant (not the current user)
          const currentUserId = 2; // From token payload, current user ID is 2
          const otherParticipant = room.members?.find((m: any) => m.id !== currentUserId) || room.members?.[0];
          const companyName = room.content_object?.job?.organization?.display_name || room.content_object?.job?.organization?.official_name;
          
          return {
            ...room,
            name: companyName || 'Unknown Company',
            participant: {
              id: otherParticipant?.id || null,
              first_name: otherParticipant?.first_name || '',
              last_name: otherParticipant?.last_name || '',
              avatar: otherParticipant?.avatar || null,
              company: companyName || null,
              role: room.content_object?.job?.title || null,
            },
            last_message: {
              content: room.last_message_text || 'No messages yet',
            },
            unread_count: room.unread_message_count || 0,
            updated_at: room.last_message_date_created ? new Date(room.last_message_date_created * 1000).toISOString() : new Date().toISOString(),
          };
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { room } = req.query;
      const response = await fetch(`https://api.baltek.net/api/chat/messages/?room=${room}`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Chat messages API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { room, content } = req.body;
      
      const response = await fetch(`https://api.baltek.net/api/chat/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
        body: JSON.stringify({
          room: parseInt(room),
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Send message API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Broadcast to WebSocket clients
      const wss = (app as any).wss;
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "new_message",
              conversation_id: parseInt(room),
              message: data
            }));
          }
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
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
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'join_conversation':
            (ws as any).conversationId = data.conversation_id;
            break;
          case 'send_message':
            // Broadcast message to all clients in the same conversation
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && (client as any).conversationId === data.conversation_id) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  conversation_id: data.conversation_id,
                  message: data.message
                }));
              }
            });
            break;
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
