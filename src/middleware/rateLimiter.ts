import rateLimit from 'express-rate-limit';
import { Request } from 'express';


export const apiKeyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: Request) => {
    if (req.apiKey && req.apiKey._id) {
      return req.apiKey._id.toString();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests using this API Key. Please try again later.',
    });
  },
});