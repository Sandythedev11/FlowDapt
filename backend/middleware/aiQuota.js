const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to check and enforce AI usage quotas
 * Free tier: 20 queries per day
 * Premium tier: 200 queries per day
 */
const checkAIQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Initialize AI quota if not exists
    if (!user.aiQuota) {
      user.aiQuota = {
        dailyUsed: 0,
        monthlyUsed: 0,
        lastReset: new Date(),
        totalUsed: 0,
      };
    }

    // Check if we need to reset daily quota (new day)
    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(user.aiQuota.lastReset).setHours(0, 0, 0, 0);

    if (lastReset < today) {
      user.aiQuota.dailyUsed = 0;
      user.aiQuota.lastReset = new Date();
      logger.info('AI Quota Reset', {
        userId: user._id,
        previousUsage: user.aiQuota.dailyUsed,
      });
    }

    // Determine quota based on subscription
    const dailyLimit = user.subscription === 'premium' ? 200 : 20;
    const monthlyLimit = user.subscription === 'premium' ? 5000 : 500;

    // Check daily limit
    if (user.aiQuota.dailyUsed >= dailyLimit) {
      logger.logSecurity('AI Quota Exceeded - Daily', {
        userId: user._id,
        used: user.aiQuota.dailyUsed,
        limit: dailyLimit,
        subscription: user.subscription,
      });

      return res.status(429).json({
        success: false,
        message: `Daily AI query limit reached (${dailyLimit} queries).`,
        quota: {
          used: user.aiQuota.dailyUsed,
          limit: dailyLimit,
          remaining: 0,
          resetTime: new Date(today + 24 * 60 * 60 * 1000).toISOString(),
        },
        upgradeMessage:
          user.subscription === 'free'
            ? 'Upgrade to premium for 200 queries per day.'
            : null,
      });
    }

    // Check monthly limit
    if (user.aiQuota.monthlyUsed >= monthlyLimit) {
      logger.logSecurity('AI Quota Exceeded - Monthly', {
        userId: user._id,
        used: user.aiQuota.monthlyUsed,
        limit: monthlyLimit,
      });

      return res.status(429).json({
        success: false,
        message: `Monthly AI query limit reached (${monthlyLimit} queries).`,
        quota: {
          monthlyUsed: user.aiQuota.monthlyUsed,
          monthlyLimit: monthlyLimit,
        },
      });
    }

    // Increment usage counters
    user.aiQuota.dailyUsed += 1;
    user.aiQuota.monthlyUsed += 1;
    user.aiQuota.totalUsed += 1;
    await user.save();

    // Add quota info to request for logging
    req.aiQuota = {
      used: user.aiQuota.dailyUsed,
      limit: dailyLimit,
      remaining: dailyLimit - user.aiQuota.dailyUsed,
    };

    logger.info('AI Query Allowed', {
      userId: user._id,
      dailyUsed: user.aiQuota.dailyUsed,
      dailyLimit: dailyLimit,
      remaining: dailyLimit - user.aiQuota.dailyUsed,
    });

    next();
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI quota',
      error: error.message,
    });
  }
};

/**
 * Middleware to check storage quota for file uploads
 * Free tier: 100MB total storage
 * Premium tier: 5GB total storage
 */
const checkStorageQuota = async (req, res, next) => {
  try {
    const Upload = require('../models/Upload');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate current storage usage
    const uploads = await Upload.find({ user: req.user.id });
    const totalSize = uploads.reduce((sum, upload) => sum + (upload.fileSize || 0), 0);

    // Determine storage limit based on subscription
    const storageLimit =
      user.subscription === 'premium'
        ? 5 * 1024 * 1024 * 1024 // 5GB
        : 100 * 1024 * 1024; // 100MB

    // Check if adding this file would exceed limit
    const fileSize = req.file?.size || 0;
    const newTotal = totalSize + fileSize;

    if (newTotal > storageLimit) {
      logger.logSecurity('Storage Quota Exceeded', {
        userId: user._id,
        currentSize: totalSize,
        fileSize: fileSize,
        limit: storageLimit,
        subscription: user.subscription,
      });

      return res.status(429).json({
        success: false,
        message: 'Storage quota exceeded.',
        quota: {
          used: totalSize,
          limit: storageLimit,
          remaining: Math.max(0, storageLimit - totalSize),
          usedMB: (totalSize / (1024 * 1024)).toFixed(2),
          limitMB: (storageLimit / (1024 * 1024)).toFixed(2),
        },
        upgradeMessage:
          user.subscription === 'free'
            ? 'Upgrade to premium for 5GB storage or delete old files.'
            : 'Please delete old files to free up space.',
      });
    }

    // Add storage info to request
    req.storageQuota = {
      used: totalSize,
      limit: storageLimit,
      remaining: storageLimit - newTotal,
    };

    logger.info('Storage Check Passed', {
      userId: user._id,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      limitMB: (storageLimit / (1024 * 1024)).toFixed(2),
    });

    next();
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      success: false,
      message: 'Failed to check storage quota',
      error: error.message,
    });
  }
};

module.exports = {
  checkAIQuota,
  checkStorageQuota,
};
