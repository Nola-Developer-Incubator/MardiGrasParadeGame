// Lazy-initializing Vercel serverless handler to avoid throwing during module import-time.
// This prevents cold-start failures when environment variables or dev-only packages
// are not available at import time.

import type { IncomingMessage, ServerResponse } from 'http';

let _handler: any = null;
let _initError: any = null;

async function initHandler() {
  if (_handler) return _handler;
  if (_initError) throw _initError;

  try {
    // Dynamically import the app factory and serverless wrapper so the module
    // evaluation doesn't fail during cold start if devDependencies or envs are missing.
    const appModule = await import('./express-app');
    const createApp = (appModule && (appModule.default || appModule.createApp)) || appModule;
    if (typeof createApp !== 'function') {
      throw new Error('createApp is not a function');
    }

    const app = createApp();

    const serverlessModule = await import('serverless-http');
    const serverlessFn = serverlessModule && (serverlessModule.default || serverlessModule);
    if (typeof serverlessFn !== 'function') {
      throw new Error('serverless-http did not export a function');
    }

    _handler = serverlessFn(app);
    return _handler;
  } catch (err) {
    // Cache init error to avoid repeated re-init attempts on subsequent invocations
    _initError = err;
    console.error('[vercel-handler] initialization error:', err);
    throw err;
  }
}

/**
 * Vercel-compatible default export handler. This function lazily initializes the
 * Express app on first invocation and then delegates to the `serverless-http` handler.
 */
export default async function vercelHandler(req: IncomingMessage & any, res: ServerResponse & any) {
  try {
    const handler = await initHandler();
    // handler expects (req, res) like a standard Node http request
    return handler(req, res);
  } catch (err) {
    console.error('[vercel-handler] invocation error:', err);
    try {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server initialization failed' }));
    } catch (e) {
      // If even responding fails, just log and swallow to avoid crashing the runtime
      console.error('[vercel-handler] failed to send error response:', e);
    }
  }
}

// Provide CommonJS compatibility so both ESM and CJS consumers on Vercel can use the handler
// (Vercel may invoke the function via module.exports under some runtimes).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: module.exports assignment for compatibility
module.exports = vercelHandler;
