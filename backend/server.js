require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const { connectDB, getConnectionState } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { checkDatabaseForAuth } = require('./middleware/dbCheck');
const { getSMTPStatus } = require('./utils/emailService');
const logger = require('./utils/logger');
const { initializeCleanupJobs } = require('./utils/fileCleanup');
const {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
  passwordResetLimiter,
} = require('./middleware/rateLimiter');
const { checkAIQuota, checkStorageQuota } = require('./middleware/aiQuota');

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// ============================================
// STARTUP VALIDATION
// ============================================

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         FlowDapt Analytics Platform - Server Startup      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Validate critical environment variables
const validateEnvironment = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    console.error('❌ [STARTUP] Missing required environment variables:');
    missing.forEach(key => console.error(`   • ${key}`));
    console.error('\n   Please check your .env file\n');
    return false;
  }
  
  logger.info('Environment variables validated');
  console.log('✅ [STARTUP] Environment variables validated');
  return true;
};

// Initialize Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS - Configure for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.logRequest(req);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Basic health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'FlowDapt Analytics Platform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Detailed health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = getConnectionState();
  const smtpStatus = getSMTPStatus();
  
  const isHealthy = dbState.isConnected && smtpStatus.ready;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        connected: dbState.isConnected,
        state: dbState.readyStateText,
        readyState: dbState.readyState,
      },
      email: {
        ready: smtpStatus.ready,
        configured: smtpStatus.configured,
        error: smtpStatus.error || null,
      },
      api: {
        status: 'operational',
      },
    },
  });
});

// ============================================
// ROUTES WITH RATE LIMITING & MIDDLEWARE
// ============================================

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Auth routes with strict rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/auth', checkDatabaseForAuth, authRoutes);

// Upload routes with storage quota check
app.use('/api/upload', checkDatabaseForAuth, uploadLimiter, uploadRoutes);

// AI routes with quota and rate limiting
app.use('/api/ai/chat', aiLimiter, checkAIQuota);
app.use('/api/ai', checkDatabaseForAuth, aiRoutes);

// Feedback routes
app.use('/api/feedback', feedbackRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER STARTUP SEQUENCE
// ============================================

const startServer = async () => {
  try {
    // Step 1: Validate environment
    console.log('📋 [STARTUP] Step 1: Validating environment variables...');
    if (!validateEnvironment()) {
      console.error('💥 [STARTUP] Startup aborted due to missing configuration\n');
      process.exit(1);
    }
    
    // Step 2: Connect to MongoDB
    console.log('\n📋 [STARTUP] Step 2: Connecting to MongoDB...');
    await connectDB();
    
    // Step 3: Initialize cleanup jobs
    console.log('\n📋 [STARTUP] Step 3: Initializing cleanup jobs...');
    initializeCleanupJobs();
    logger.info('Cleanup jobs initialized');
    
    // Step 4: Wait for SMTP verification
    console.log('\n📋 [STARTUP] Step 4: Verifying SMTP connection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const smtpStatus = getSMTPStatus();
    if (!smtpStatus.ready) {
      logger.warn('SMTP not ready', { error: smtpStatus.error });
      console.warn('\n⚠️  [STARTUP] SMTP not ready - email features will be limited');
      if (smtpStatus.error) {
        console.warn(`   Error: ${smtpStatus.error}`);
      }
    }
    
    // Step 5: Start Express server
    console.log('\n📋 [STARTUP] Step 5: Starting Express server...');
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        database: getConnectionState().isConnected,
        email: smtpStatus.ready,
      });

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║              🚀 SERVER STARTED SUCCESSFULLY 🚀             ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`   🌐 Server URL: http://localhost:${PORT}`);
      console.log(`   📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🗄️  Database: ${getConnectionState().isConnected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`   📧 Email: ${smtpStatus.ready ? '✅ Ready' : '⚠️  Limited'}`);
      console.log(`   🛡️  Security: ✅ Helmet, Rate Limiting, Sanitization`);
      console.log(`   📊 Monitoring: ✅ Winston Logger`);
      console.log(`   🧹 Cleanup: ✅ Automated Jobs Active`);
      console.log(`\n   📍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`   📁 Logs: backend/logs/`);
      console.log('\n   Press Ctrl+C to stop the server\n');
    });
    
  } catch (error) {
    logger.error('Fatal startup error', { error: error.message, stack: error.stack });
    console.error('\n💥 [STARTUP] Fatal error during startup:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('MongoServerSelectionError')) {
      console.error('   💡 This is likely a MongoDB connection issue');
      console.error('   📋 Please check:');
      console.error('      1. MongoDB Atlas IP whitelist settings');
      console.error('      2. Internet connectivity');
      console.error('      3. MONGO_URI in .env file');
      console.error('      4. MongoDB Atlas cluster status\n');
    }
    
    console.error('   ⚠️  Server will start but may not function correctly');
    console.error('   ⚠️  Fix the issues above and restart the server\n');
    
    // Start server anyway but in degraded mode
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n⚠️  Server running in DEGRADED mode on port ${PORT}`);
      console.log(`   Some features will not work until issues are resolved\n`);
    });
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
