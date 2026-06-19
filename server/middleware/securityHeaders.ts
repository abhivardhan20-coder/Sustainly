// server/middleware/securityHeaders.ts
import helmet from 'helmet';
import { RequestHandler } from 'express';

// Strict Content Security Policy tailored for React/Vite + Firebase
export const securityHeaders: RequestHandler = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Needed for React inline scripts in some setups
        "https://apis.google.com", 
        "https://www.gstatic.com"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Needed for styled-components or Tailwind
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "blob:", 
        "https://lh3.googleusercontent.com", // Google OAuth avatars
        "https://firebasestorage.googleapis.com"
      ],
      connectSrc: [
        "'self'", 
        "https://identitytoolkit.googleapis.com", 
        "https://securetoken.googleapis.com",
        "https://firestore.googleapis.com",
        "wss://*.firebaseio.com" // Firebase realtime connections
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["https://sustainly.firebaseapp.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Often causes issues with external assets if true
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows loading cross-origin resources
});
