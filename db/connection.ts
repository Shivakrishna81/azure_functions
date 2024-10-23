import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MongoDBConnectionString as string);
        console.log('Connected to MongoDB successfully.');
    } catch (error) {
        console.error('Unable to connect to MongoDB:', error);
    }
};

export { connectDB };
