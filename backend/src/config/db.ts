import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  try {
    console.log(`URI exists: ${!!process.env.MONGODB_URI}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = conn.connection.readyState === 1;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
