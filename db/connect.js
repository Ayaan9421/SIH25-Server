import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    // The connection string is securely stored in an environment variable
    const MONGO_URI = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure if the connection fails
    process.exit(1);
  }
};

// Optional: Listen for connection events for better monitoring
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

export default connectDB;
