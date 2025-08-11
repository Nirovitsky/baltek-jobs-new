import express from 'express';
import { createServer as createViteServer } from 'vite';

const port = Number(process.env.PORT) || 5000;

console.log(`[express] serving on port ${port}`);

async function createServer() {
  const app = express();

  try {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Use vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server ready on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

createServer();