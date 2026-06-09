import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";
import apiRoutes from "./server/routes/api";

export const app = express();

const PORT = 4321;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Vite dev server requires custom CSP, so we disable default for MVP
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
      console.error(`[API Error] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - IP: ${safeIp}`);
    } else if (duration > 2000) {
      console.warn(`[Unusual Traffic] Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    } else {
      console.log(`[Traffic] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

const limiter = rateLimit({
  windowMs: 60000,
  max: 30,
  handler: (req, res, next, options) => {
    const safeIp = req.ip ? req.ip.replace(/\.\d+$/, '.xxx') : 'unknown';
    console.warn(`[Security Alert] Global rate limit exceeded! IP: ${safeIp} path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

const aiLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  handler: (req, res, next, options) => {
    const safeIp = req.ip ? req.ip.replace(/\.\d+$/, '.xxx') : 'unknown';
    console.warn(`[Abuse Protection] AI rate limit exceeded! IP: ${safeIp} path: ${req.originalUrl}`);
    res.status(429).json({ error: "Too many AI generation requests. Please try again later." });
  }
});

app.use('/api/', limiter);
app.use('/api/insights', aiLimiter);
app.use('/api/log', aiLimiter);
app.use(express.json({ limit: '512kb' }));

// Mount modular API routes
app.use('/api', apiRoutes);

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Auto-start only when run directly (not when imported for testing)
if (require.main === module) {
  startServer();
}
