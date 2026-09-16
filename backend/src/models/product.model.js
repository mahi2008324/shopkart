import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative']
    }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
