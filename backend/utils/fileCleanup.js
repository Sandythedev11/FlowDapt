const cron = require('node-cron');
const Upload = require('../models/Upload');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Delete files older than specified days for free users
 * Premium users keep files indefinitely
 */
const cleanupOldFiles = async () => {
  try {
    logger.info('Starting file cleanup job...');

    // Delete files older than 30 days for free users
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find old uploads from free users
    const oldUploads = await Upload.find({
      createdAt: { $lt: thirtyDaysAgo },
    }).populate('user', 'subscription');

    let deletedCount = 0;
    let freedSpace = 0;

    for (const upload of oldUploads) {
      // Skip if user is premium
      if (upload.user?.subscription === 'premium') {
        continue;
      }

      try {
        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', upload.filePath);
        await fs.unlink(filePath);

        // Delete database record
        await Upload.findByIdAndDelete(upload._id);

        deletedCount++;
        freedSpace += upload.fileSize || 0;

        logger.info('Deleted old file', {
          fileName: upload.fileName,
          userId: upload.user?._id,
          age: Math.floor((Date.now() - upload.createdAt) / (24 * 60 * 60 * 1000)),
        });
      } catch (err) {
        logger.error(`Failed to delete file: ${upload.fileName}`, {
          error: err.message,
          uploadId: upload._id,
        });
      }
    }

    logger.info('File cleanup completed', {
      deletedCount,
      freedSpaceMB: (freedSpace / (1024 * 1024)).toFixed(2),
    });

    return { deletedCount, freedSpace };
  } catch (error) {
    logger.error('File cleanup job failed', { error: error.message });
    throw error;
  }
};

/**
 * Delete orphaned files (files in uploads folder but not in database)
 */
const cleanupOrphanedFiles = async () => {
  try {
    logger.info('Starting orphaned files cleanup...');

    const uploadsDir = path.join(__dirname, '../uploads');
    const files = await fs.readdir(uploadsDir);

    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);

      // Check if file exists in database
      const upload = await Upload.findOne({ filePath: `uploads/${file}` });

      if (!upload) {
        try {
          const stats = await fs.stat(filePath);
          await fs.unlink(filePath);

          deletedCount++;
          freedSpace += stats.size;

          logger.info('Deleted orphaned file', {
            fileName: file,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          });
        } catch (err) {
          logger.error(`Failed to delete orphaned file: ${file}`, {
            error: err.message,
          });
        }
      }
    }

    logger.info('Orphaned files cleanup completed', {
      deletedCount,
      freedSpaceMB: (freedSpace / (1024 * 1024)).toFixed(2),
    });

    return { deletedCount, freedSpace };
  } catch (error) {
    logger.error('Orphaned files cleanup failed', { error: error.message });
    throw error;
  }
};

/**
 * Reset monthly AI quotas for all users
 */
const resetMonthlyQuotas = async () => {
  try {
    logger.info('Starting monthly quota reset...');

    const result = await User.updateMany(
      {},
      {
        $set: {
          'aiQuota.monthlyUsed': 0,
        },
      }
    );

    logger.info('Monthly quotas reset', {
      usersUpdated: result.modifiedCount,
    });

    return result;
  } catch (error) {
    logger.error('Monthly quota reset failed', { error: error.message });
    throw error;
  }
};

/**
 * Generate storage usage report
 */
const generateStorageReport = async () => {
  try {
    const uploads = await Upload.find().populate('user', 'email subscription');

    const report = {
      totalFiles: uploads.length,
      totalSize: 0,
      bySubscription: {
        free: { count: 0, size: 0 },
        premium: { count: 0, size: 0 },
      },
      byFileType: {},
    };

    uploads.forEach((upload) => {
      report.totalSize += upload.fileSize || 0;

      const subscription = upload.user?.subscription || 'free';
      report.bySubscription[subscription].count++;
      report.bySubscription[subscription].size += upload.fileSize || 0;

      if (!report.byFileType[upload.fileType]) {
        report.byFileType[upload.fileType] = { count: 0, size: 0 };
      }
      report.byFileType[upload.fileType].count++;
      report.byFileType[upload.fileType].size += upload.fileSize || 0;
    });

    // Convert sizes to MB
    report.totalSizeMB = (report.totalSize / (1024 * 1024)).toFixed(2);
    report.bySubscription.free.sizeMB = (
      report.bySubscription.free.size /
      (1024 * 1024)
    ).toFixed(2);
    report.bySubscription.premium.sizeMB = (
      report.bySubscription.premium.size /
      (1024 * 1024)
    ).toFixed(2);

    Object.keys(report.byFileType).forEach((type) => {
      report.byFileType[type].sizeMB = (
        report.byFileType[type].size /
        (1024 * 1024)
      ).toFixed(2);
    });

    logger.info('Storage report generated', report);
    return report;
  } catch (error) {
    logger.error('Storage report generation failed', { error: error.message });
    throw error;
  }
};

/**
 * Initialize cron jobs
 */
const initializeCleanupJobs = () => {
  // Run file cleanup daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running scheduled file cleanup...');
    try {
      await cleanupOldFiles();
      await cleanupOrphanedFiles();
    } catch (error) {
      logger.error('Scheduled cleanup failed', { error: error.message });
    }
  });

  // Reset monthly quotas on the 1st of each month at midnight
  cron.schedule('0 0 1 * *', async () => {
    logger.info('Running monthly quota reset...');
    try {
      await resetMonthlyQuotas();
    } catch (error) {
      logger.error('Monthly quota reset failed', { error: error.message });
    }
  });

  // Generate storage report weekly on Sundays at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Generating weekly storage report...');
    try {
      await generateStorageReport();
    } catch (error) {
      logger.error('Storage report generation failed', { error: error.message });
    }
  });

  logger.info('Cleanup cron jobs initialized', {
    fileCleanup: 'Daily at 2 AM',
    quotaReset: '1st of month at midnight',
    storageReport: 'Sundays at 3 AM',
  });
};

module.exports = {
  cleanupOldFiles,
  cleanupOrphanedFiles,
  resetMonthlyQuotas,
  generateStorageReport,
  initializeCleanupJobs,
};
