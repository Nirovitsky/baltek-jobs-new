import express, { Request, Response } from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/hello", (_req: Request, res: Response) => {
  res.send("Hello Vite + React + TypeScript!");
});

const port = Number(process.env.PORT) || 5000;

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);