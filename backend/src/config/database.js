import mongoose from 'mongoose';
import { env } from './env.mjs';

/**
 * MongoDB Connection
 * Connects to MongoDB using connection string from environment variables
 */
export async function connectDatabase() {
  try {
    const mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please add it to backend/.env file. See MONGODB_SETUP.md for instructions.');
    }

    await mongoose.connect(mongoUri, {
      // Options for compatibility and performance
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    if (env.NODE_ENV === 'development') {
      console.log('✅ Connected to MongoDB');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Handle MongoDB connection events
 */
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

/**
 * Graceful shutdown
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected gracefully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

