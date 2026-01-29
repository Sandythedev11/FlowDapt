const mongoose = require('mongoose');

// ============================================
// DATABASE CONNECTION CHECK MIDDLEWARE
// ============================================

/**
 * Middleware to verify database connection before processing requests
 * Returns 503 Service Unavailable if database is not connected
 */
const checkDatabaseConnection = (req, res, next) => {
  const readyState = mongoose.connection.readyState;
  
  // readyState values:
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  
  if (readyState !== 1) {
    const stateText = ['disconnected', 'connected', 'connecting', 'disconnecting'][readyState] || 'unknown';
    
    console.error(`\n❌ [DB CHECK] Request blocked - Database ${stateText}`);
    console.error(`   Route: ${req.method} ${req.originalUrl}`);
    console.error(`   Client IP: ${req.ip}`);
    
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      error: 'SERVICE_UNAVAILABLE',
      details: process.env.NODE_ENV === 'development' 
        ? `Database is currently ${stateText}. Please check server logs.`
        : undefined,
    });
  }
  
  // Database is connected, proceed
  next();
};

/**
 * Middleware specifically for authentication routes
 * Provides more detailed error messages for auth failures
 */
const checkDatabaseForAuth = (req, res, next) => {
  const readyState = mongoose.connection.readyState;
  
  if (readyState !== 1) {
    const stateText = ['disconnected', 'connected', 'connecting', 'disconnecting'][readyState] || 'unknown';
    
    console.error(`\n❌ [AUTH DB CHECK] Authentication request blocked`);
    console.error(`   Database State: ${stateText}`);
    console.error(`   Route: ${req.method} ${req.originalUrl}`);
    console.error(`   Action: ${req.path}`);
    
    return res.status(503).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      error: 'DATABASE_UNAVAILABLE',
      details: process.env.NODE_ENV === 'development'
        ? {
            reason: `Database is ${stateText}`,
            suggestion: 'Check MongoDB connection in server logs',
            mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set',
          }
        : undefined,
    });
  }
  
  next();
};

module.exports = {
  checkDatabaseConnection,
  checkDatabaseForAuth,
};
