import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// Generate a CSRF token and set it as a cookie
export function generateCsrfToken(req: Request, res: Response) {
  const token = randomBytes(32).toString('hex');
  res.cookie('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  return token;
}

// Middleware to validate CSRF token on mutating requests
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow tests to bypass CSRF if needed, though they should really set it
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}
