import mongoose from 'mongoose';
import dns from 'node:dns';
import Product from '../models/product.model.js';
import sampleProducts from '../data/sampleProducts.js';

// Use Google's public DNS to reliably resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedInitialProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log('Seeded initial products.');
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedInitialProducts();
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

export default connectDB;
