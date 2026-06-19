import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate a CSRF token and set it as a cookie
  let token = req.cookies?.['csrfToken'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // Must be readable by client JS to send back in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  // Only validate state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (process.env.NODE_ENV === 'test') return next();
    
    const headerToken = req.headers['x-csrf-token'];
    if (!headerToken || headerToken !== token) {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }
  }

  next();
};
