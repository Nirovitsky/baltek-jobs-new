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

  // Chat API endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const response = await fetch("https://api.baltek.net/api/chat/rooms/", {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      
      if (!response.ok) {
        // Return mock data for development if API is not available
        const mockConversations = {
          results: [
            {
              id: 1,
              participant: {
                id: 2,
                first_name: "Sarah",
                last_name: "Johnson",
                avatar: "/api/placeholder/32/32",
                role: "Senior Recruiter",
                company: "TechCorp Solutions"
              },
              last_message: {
                id: 1,
                content: "Hi! I saw your profile and think you'd be a great fit for our Senior Developer role. Are you interested in discussing this opportunity?",
                sender: { id: 2, first_name: "Sarah", last_name: "Johnson" },
                created_at: new Date(Date.now() - 3600000).toISOString(),
                read: false
              },
              unread_count: 2,
              updated_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 2,
              participant: {
                id: 3,
                first_name: "Michael",
                last_name: "Chen",
                avatar: "/api/placeholder/32/32",
                role: "Hiring Manager",
                company: "StartupXYZ"
              },
              last_message: {
                id: 2,
                content: "Thanks for your application! We'd like to schedule an interview. When would be a good time for you?",
                sender: { id: 3, first_name: "Michael", last_name: "Chen" },
                created_at: new Date(Date.now() - 86400000).toISOString(),
                read: true
              },
              unread_count: 0,
              updated_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        };
        res.json(mockConversations);
        return;
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await fetch(`https://api.baltek.net/api/chat/messages/?room=${id}`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
      
      if (!response.ok) {
        // Return mock messages for development
        const mockMessages = {
          results: id === "1" ? [
            {
              id: 1,
              content: "Hi! I saw your profile and think you'd be a great fit for our Senior Developer role. Are you interested in discussing this opportunity?",
              sender: { id: 2, first_name: "Sarah", last_name: "Johnson" },
              created_at: new Date(Date.now() - 7200000).toISOString(),
              read: true
            },
            {
              id: 2,
              content: "Yes, I'd be very interested! Could you tell me more about the role and the company?",
              sender: { id: 1, first_name: "You", last_name: "" },
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read: true
            },
            {
              id: 3,
              content: "Absolutely! It's a Senior React Developer position focusing on building scalable web applications. The team is very collaborative and we offer competitive compensation plus remote work options.",
              sender: { id: 2, first_name: "Sarah", last_name: "Johnson" },
              created_at: new Date(Date.now() - 1800000).toISOString(),
              read: false
            }
          ] : [
            {
              id: 4,
              content: "Thanks for your application! We'd like to schedule an interview. When would be a good time for you?",
              sender: { id: 3, first_name: "Michael", last_name: "Chen" },
              created_at: new Date(Date.now() - 86400000).toISOString(),
              read: true
            }
          ]
        };
        res.json(mockMessages);
        return;
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const response = await fetch(`https://api.baltek.net/api/chat/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
        },
        body: JSON.stringify({
          room: parseInt(id),
          content,
        }),
      });
      
      if (!response.ok) {
        // Mock successful response for development
        const mockMessage = {
          id: Date.now(),
          content,
          sender: { id: 1, first_name: "You", last_name: "" },
          created_at: new Date().toISOString(),
          read: false
        };
        
        // Broadcast to WebSocket clients (will be available after server setup)
        const wss = (app as any).wss;
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "new_message",
                conversation_id: parseInt(id),
                message: mockMessage
              }));
            }
          });
        }
        
        res.json(mockMessage);
        return;
      }
      
      const data = await response.json();
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
            ws.conversationId = data.conversation_id;
            break;
          case 'send_message':
            // Broadcast message to all clients in the same conversation
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client.conversationId === data.conversation_id) {
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
