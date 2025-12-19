import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export function attachRoutes(app: Express) {
  // health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Create user
  app.post('/api/users', async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser(result.data);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Get user by ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
  });

  // Get user by username (query parameter)
  app.get('/api/users', async (req, res) => {
    try {
      const username = req.query.username as string;
      if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
  });

  // serve runtime bot override if present at project root (bots.override.json)
  app.get('/bots.override.json', (_req, res) => {
    const file = path.resolve(process.cwd(), 'bots.override.json');
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'no override' });
    try {
      const content = fs.readFileSync(file, 'utf-8');
      return res.status(200).type('application/json').send(content);
    } catch (e) {
      return res.status(500).json({ error: 'failed to read override' });
    }
  });

  // simple admin-only route to save overrides (local development only)
  app.post('/admin/bots', (req, res) => {
    // Prevent writes in production / serverless environments (e.g., Vercel)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return res.status(403).json({ error: 'writing overrides is disabled in production' });
    }

    try {
      const file = path.resolve(process.cwd(), 'bots.override.json');
      fs.writeFileSync(file, JSON.stringify(req.body, null, 2), 'utf-8');
      return res.status(200).json({ status: 'saved' });
    } catch (e) {
      return res.status(500).json({ error: 'failed to save' });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // attach routes to the provided app then return an http.Server
  attachRoutes(app);
  return createServer(app);
}
