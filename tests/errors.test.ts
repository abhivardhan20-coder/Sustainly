import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, AuthError, RateLimitError, NotFoundError } from '../server/utils/errors';

describe('Custom Errors', () => {
  it('AppError has correct properties', () => {
    const err = new AppError('Test error', 501, false);
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(501);
    expect(err.isOperational).toBe(false);
    expect(err.name).toBe('AppError');
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError();
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe('ValidationError');
  });

  it('AuthError defaults to 401', () => {
    const err = new AuthError();
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe('AuthError');
  });

  it('RateLimitError defaults to 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.name).toBe('RateLimitError');
  });

  it('NotFoundError defaults to 404', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('NotFoundError');
  });
});
