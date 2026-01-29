const mongoose = require('mongoose');

// ============================================
// MONGODB CONNECTION WITH ENHANCED ERROR HANDLING
// ============================================

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Connection state getter
const getConnectionState = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
};

// Enhanced connection function with retry logic
const connectDB = async () => {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ [MongoDB] Already connected');
    return mongoose.connection;
  }

  connectionAttempts++;

  try {
    console.log(`\n🔄 [MongoDB] Connection attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}`);
    console.log(`   URI: ${process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@') || 'NOT SET'}`);

    // Validate MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    isConnected = true;
    connectionAttempts = 0; // Reset on success

    console.log(`✅ [MongoDB] Connected successfully`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (connected)`);

    return conn;
  } catch (error) {
    isConnected = false;
    
    console.error(`\n❌ [MongoDB] Connection failed (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`);
    console.error(`   Error: ${error.message}`);

    // Provide helpful error messages based on error type
    if (error.message.includes('ENOTFOUND')) {
      console.error(`   💡 DNS Resolution Failed - Check your internet connection and MongoDB URI`);
    } else if (error.message.includes('authentication failed')) {
      console.error(`   💡 Authentication Failed - Check your MongoDB username and password`);
    } else if (error.message.includes('MongoServerSelectionError')) {
      console.error(`   💡 Server Selection Failed - Possible causes:`);
      console.error(`      • IP address not whitelisted in MongoDB Atlas`);
      console.error(`      • Network connectivity issues`);
      console.error(`      • Incorrect connection string`);
      console.error(`\n   📋 MongoDB Atlas IP Whitelist Instructions:`);
      console.error(`      1. Go to https://cloud.mongodb.com`);
      console.error(`      2. Select your cluster`);
      console.error(`      3. Click "Network Access" in the left sidebar`);
      console.error(`      4. Click "Add IP Address"`);
      console.error(`      5. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)`);
      console.error(`      6. For production: Add your specific server IP address`);
      console.error(`      7. Click "Confirm"`);
    } else if (error.message.includes('bad auth')) {
      console.error(`   💡 Invalid Credentials - Check MONGO_URI username and password`);
    }

    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`\n⏳ [MongoDB] Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(); // Recursive retry
    } else {
      console.error(`\n💥 [MongoDB] Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached`);
      console.error(`   ⚠️  Server will start but database operations will fail`);
      console.error(`   ⚠️  Please fix the connection issue and restart the server\n`);
      throw error;
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅ [MongoDB Event] Connected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ [MongoDB Event] Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️  [MongoDB Event] Disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('\n✅ [MongoDB] Connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ [MongoDB] Error during shutdown:', err);
    process.exit(1);
  }
});

module.exports = { connectDB, getConnectionState, isConnected: () => isConnected };
