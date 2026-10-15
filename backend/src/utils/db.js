import mongoose from 'mongoose';
import dns from 'node:dns';
import Product from '../models/product.model.js';
import sampleProducts from '../data/sampleProducts.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore DNS config errors
}

const seedInitialProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count < 35) {
      const existing = await Product.find({}, 'name');
      const existingNames = new Set(existing.map((p) => p.name.trim().toLowerCase()));
      const toInsert = sampleProducts.filter(
        (p) => !existingNames.has(p.name.trim().toLowerCase())
      );
      if (toInsert.length > 0) {
        await Product.insertMany(toInsert);
        console.log(`Seeded ${toInsert.length} products into catalog.`);
      }
    }
  } catch (err) {
    console.error('Error during initial product seeding:', err.message);
  }
};

const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected via in-memory server: ${conn.connection.host}`);
    await seedInitialProducts();
  } catch (memErr) {
    console.error('Failed to start in-memory Mongo server:', memErr.message);
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedInitialProducts();
  } catch (error) {
    console.warn(`MongoDB Atlas connection timed out/unavailable (${error.message}). Falling back to local in-memory Mongo...`);
    await connectMemoryDB();
  }
};

export default connectDB;
