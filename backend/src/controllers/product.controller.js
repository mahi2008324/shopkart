import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import sampleProducts from '../data/sampleProducts.js';

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required'
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    const product = await Product.create({ name, description, price, category, image, stock });

    return res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Error creating product' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };

    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();

    if (count > 0 && !req.body.force) {
      const products = await Product.find();
      return res.status(200).json({ success: true, message: 'Products already seeded', count: products.length, products });
    }

    if (req.body.force) await Product.deleteMany({});

    const createdProducts = await Product.insertMany(sampleProducts);
    return res.status(201).json({
      success: true,
      message: 'Sample products seeded successfully',
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error seeding products' });
  }
};

export { createProduct, getProducts, getProductById, seedProducts };
