// Vercel Serverless Function Entry Point
// This file handles API routes for Vercel preview/prod deployments
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertUserSchema } from '../shared/schema';
import { fromZodError } from 'zod-validation-error';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.split('?')[0] || '';
  const queryParams = new URLSearchParams(url?.split('?')[1] || '');

  try {
    // Health check endpoint
    if (path === '/api/health' && method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'production'
      });
    }

    // Create user
    if (path === '/api/users' && method === 'POST') {
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
    }

    // Get user by username (query parameter)
    if (path === '/api/users' && method === 'GET') {
      const username = queryParams.get('username');
      if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    }

    // Get user by ID
    const userIdMatch = path.match(/^\/api\/users\/(\d+)$/);
    if (userIdMatch && method === 'GET') {
      const id = parseInt(userIdMatch[1]);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    }

    // Route not found
    return res.status(404).json({ message: 'API endpoint not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
