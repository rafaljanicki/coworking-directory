import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';

/**
 * Creates and configures the Express application for AWS Lambda environment.
 */
export async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Logging middleware: logs only /api routes
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJson: Record<string, any> | undefined;
    const originalJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJson = bodyJson;
      // @ts-ignore
      return originalJson.apply(this, [bodyJson, ...args]);
    };
    res.on('finish', () => {
      if (path.startsWith('/api')) {
        const duration = Date.now() - start;
        let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJson) {
          line += ` :: ${JSON.stringify(capturedJson)}`;
        }
        if (line.length > 120) {
          line = line.slice(0, 119) + '…';
        }
        console.log(line);
      }
    });
    next();
  });

  // Register API routes
  await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    // Rethrow to surface in Lambda logs
    throw err;
  });

  return app;
}