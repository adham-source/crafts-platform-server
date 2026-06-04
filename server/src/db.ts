import mongoose from 'mongoose';
import { config } from './config';
import logger from './utils/logger';

export async function connectDB() {
  const uri = config.mongo.uri;
  await mongoose.connect(uri as string, { dbName: 'crafts_platform' });
  logger.info('Connected to MongoDB');
}

export default mongoose;
