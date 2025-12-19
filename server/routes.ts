import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { asyncHandler, allowMethods } from "./errorHandler";
import { requireEnv } from "./requireEnv";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Example API routes demonstrating error handling and env validation best practices
  // These show how to use asyncHandler and requireEnv for Vercel serverless functions
  
  // Example: Simple route with error handling
  app.get('/api/game-config', asyncHandler(async (req, res) => {
    // Returns game configuration data
    res.json({
      version: '1.0.0',
      features: ['3d-graphics', 'sound', 'mobile-support'],
      timestamp: new Date().toISOString()
    });
  }));

  // Example: Route that requires environment variables
  // Uncomment and customize when you add routes that need DATABASE_URL:
  /*
  app.get('/api/leaderboard', asyncHandler(async (req, res) => {
    requireEnv(['DATABASE_URL']);
    // Fetch leaderboard data from database
    // const scores = await storage.getTopScores();
    res.json({ scores: [] });
  }));
  */

  const httpServer = createServer(app);

  return httpServer;
}
