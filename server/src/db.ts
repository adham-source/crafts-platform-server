import mongoose from 'mongoose';
import { config } from './config';
import logger from './utils/logger';

export async function connectDB() {
  const uri = config.mongo.uri;
  
  if (!uri) {
    const errorMsg = 'MONGO_URI environment variable is not set!';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await mongoose.connect(uri as string, { 
      dbName: 'crafts_platform',
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    const errorMsg = `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMsg);
    throw error;
  }
}

export default mongoose;
