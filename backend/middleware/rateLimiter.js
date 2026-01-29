const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded - General API', {
      ip: req.ip,
      url: req.originalUrl,
      userId: req.user?._id,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// Strict limiter for authentication endpoints - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded - Auth', {
      ip: req.ip,
      url: req.originalUrl,
      email: req.body.email,
    });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

// AI query rate limiter - 20 queries per hour per user
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    // Rate limit per user, not per IP
    return req.user?._id?.toString() || 'anonymous';
  },
  message: {
    success: false,
    message: 'AI query limit reached (20 per hour). Please try again later or upgrade to premium.',
  },
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded - AI', {
      userId: req.user?._id,
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: 'AI query limit reached. Please try again in an hour.',
      upgradeMessage: 'Upgrade to premium for unlimited AI queries.',
    });
  },
});

// File upload rate limiter - 10 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || 'anonymous',
  message: {
    success: false,
    message: 'Upload limit reached (10 per hour). Please try again later.',
  },
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded - Upload', {
      userId: req.user?._id,
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: 'Upload limit reached. Please try again in an hour.',
    });
  },
});

// Password reset limiter - 3 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded - Password Reset', {
      ip: req.ip,
      email: req.body.email,
    });
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
  passwordResetLimiter,
};
