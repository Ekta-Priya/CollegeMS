import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_management_system';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      dbName: 'college_management_system',
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
