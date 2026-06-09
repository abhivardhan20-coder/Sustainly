import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { generateInsights, generateActivityLog } from "./lib/gemini";

const insightsCache = new Map<string, { data: string[], ts: number }>();

export const app = express();

const PORT = 4321;

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// Traffic and Security Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.error(`[API Error] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - IP: ${req.ip}`);
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
    console.warn(`[Security Alert] Global rate limit exceeded! IP: ${req.ip} path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

const aiLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  handler: (req, res, next, options) => {
    console.warn(`[Abuse Protection] AI rate limit exceeded! IP: ${req.ip} path: ${req.originalUrl}`);
    res.status(429).json({ error: "Too many AI generation requests. Please try again later." });
  }
});

app.use('/api/', limiter);
app.use('/api/insights', aiLimiter);
app.use('/api/log', aiLimiter);
app.use(express.json({ limit: '512kb' }));

// === Insights Route ===
app.post("/api/insights", async (req, res) => {
  try {
    const { profile, history } = req.body;

    if (profile && (typeof profile !== 'object' || profile === null || Array.isArray(profile))) {
      return res.status(400).json({ error: "Invalid profile data format." });
    }
    if (history && (typeof history !== 'object' || history === null || Array.isArray(history))) {
      return res.status(400).json({ error: "Invalid history data format." });
    }

    const cacheKey = profile?.id || 'anon';
    const cached = insightsCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
      return res.json(cached.data);
    }

    const result = await generateInsights(profile, history);
    insightsCache.set(cacheKey, { data: result, ts: Date.now() });
    res.json(result);

  } catch (error: any) {
    console.log("Gemini API Error (Insights):", error?.message || error);
    res.json([
      "🚴 Biking 3 days/week saves 1k lbs CO2",
      "💡 LED bulbs use 75% less energy",
      "🥦 1 plant-based meal saves 2k gal water",
      "🔌 Unplug to prevent phantom drain",
      "👕 Wash cold to save 90% energy",
      "🛍️ Reusable bags save plastic"
    ]);
  }
});

// === Activity Log Route ===
app.post("/api/log", async (req, res) => {
  try {
    const { userMessage, profile, history, imageBase64 } = req.body;

    if (userMessage && (typeof userMessage !== 'string' || userMessage.length > 1000)) {
      return res.status(400).json({ error: "Invalid userMessage format or length exceeded." });
    }
    if (imageBase64 && typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: "Invalid image format." });
    }
    if (profile && (typeof profile !== 'object' || profile === null || Array.isArray(profile))) {
      return res.status(400).json({ error: "Invalid profile data format." });
    }
    if (history && (typeof history !== 'object' || history === null || Array.isArray(history))) {
      return res.status(400).json({ error: "Invalid history data format." });
    }

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: "Missing user message or image" });
    }

    const result = await generateActivityLog({ userMessage, profile, history, imageBase64 });
    res.json(result);

  } catch (error: any) {
    console.log("Gemini API Error (Log):", error?.message || error);
    res.status(500).json({ error: "Failed to parse activity due to high demand. Please try again." });
  }
});

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
