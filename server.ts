
import { fileURLToPath } from 'url';
import express from "express";
import cors from 'cors';
import path from "path";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import apiRoutes from './server/routes/api';
import carbonRoutes from './server/routes/carbon';
import { logger } from './server/utils/logger';
import cookieParser from 'cookie-parser';
import { csrfTokenMiddleware } from './server/middleware/csrf';
import "dotenv/config";

export const app = express();

const PORT = parseInt(process.env.PORT || '4321', 10);

// Trust the first proxy (e.g., Render, Railway, Nginx, Vercel)
// This is critical for express-rate-limit to see the real user IPs
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"], // Google avatars
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com"]
    }
  } : false, // Disable only in dev for Vite HMR
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL as string]
    : ['http://localhost:4321', 'http://localhost:5173'],
  credentials: true
}));

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// Traffic and Security Logging (with redacted IPs)
app.use((req, res, next) => {
  const start = Date.now();
  const safeIp = req.ip ? req.ip.replace(/\.\d+$/, '.xxx') : 'unknown'; // Redact IP for privacy
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.error(`[API Error] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - IP: ${safeIp}`);
    } else if (duration > 2000) {
      logger.warn(`[Unusual Traffic] Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    } else {
      logger.info(`[Traffic] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

const limiter = rateLimit({
  windowMs: 60000,
  max: 30,
  validate: { ip: false },
  handler: (req, res, next, options) => {
    const safeIp = req.ip ? req.ip.replace(/\.\d+$/, '.xxx') : 'unknown';
    logger.warn(`[Security Alert] Global rate limit exceeded! IP: ${safeIp} path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

app.use('/api/', limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// Mount modular API routes
app.use('/api', csrfTokenMiddleware, apiRoutes);
app.use('/api/carbon', carbonRoutes);

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  // Note: Vite middleware is async, so we handle it separately in startServer
}

// Separate start function for production/dev server
export async function startServer() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing required environment variables");
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

// Auto-start only when run directly (not when imported for testing)
const __isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (__isMain) {
  startServer();
}
