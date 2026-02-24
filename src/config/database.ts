import mongoose from 'mongoose';
import config from './index';


const connectDB = async (): Promise<void> => {
  try {

    const uri = config.db.uri;

    if (!uri) {
      throw new Error('DB_URI is not defined in environment variables or passed as an argument');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    } else {
      console.error('❌ An unknown error occurred while connecting to MongoDB:', error);
    }
    process.exit(1);
  }
};

export default connectDB;
