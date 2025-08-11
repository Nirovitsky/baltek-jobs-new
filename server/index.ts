import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 5000;

// Serve static files from the client directory during development
if (process.env.NODE_ENV === 'development') {
  try {
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(viteServer.ssrFixStacktrace);
    app.use(viteServer.middlewares);
  } catch (error) {
    console.error('Failed to create Vite server:', error);
    // Fallback: serve static files
    app.use(express.static(join(__dirname, '../client')));
  }
} else {
  // Serve built files in production
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`[express] serving on port ${port}`);
});