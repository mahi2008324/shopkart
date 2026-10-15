import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './src/models/product.model.js';
import sampleProducts from './src/data/sampleProducts.js';

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set in environment.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);

  const existingProducts = await Product.find({}, 'name');
  const existingNames = new Set(existingProducts.map((p) => p.name.trim().toLowerCase()));

  const newProducts = sampleProducts.filter(
    (p) => !existingNames.has(p.name.trim().toLowerCase())
  );

  if (newProducts.length > 0) {
    console.log(`Found ${newProducts.length} new products to insert.`);
    const inserted = await Product.insertMany(newProducts);
    console.log(`Successfully inserted ${inserted.length} products.`);
  } else {
    console.log('All sample products are already in the database.');
  }

  const totalCount = await Product.countDocuments();
  console.log(`Current Total Products in Database: ${totalCount}`);

  // Breakdown by category
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  console.log('Category breakdown:');
  categories.forEach((cat) => {
    console.log(`  - ${cat._id}: ${cat.count} items`);
  });

  await mongoose.disconnect();
  console.log('Finished seeding.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
