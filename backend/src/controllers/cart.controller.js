import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

const populatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: 'cart.product',
    select: 'name description price category image stock'
  });
  return (customer?.cart || []).filter((item) => item.product !== null);
};

/**
 * @desc   Add product to cart (or increment quantity if already present)
 * @route  POST /cart/:productId
 * @access Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increment quantity — but respect stock
      const newQty = existingItem.quantity + 1;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`
        });
      }
      existingItem.quantity = newQty;
    } else {
      // Ensure at least 1 unit of stock exists
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock'
        });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const cart = await populatedCart(req.user._id);
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

/**
 * @desc   Get current user's cart
 * @route  GET /cart
 * @access Private
 */
export const getCart = async (req, res) => {
  try {
    const cart = await populatedCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

/**
 * @desc   Update quantity of a cart item
 * @route  PATCH /cart/:productId
 * @access Private
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (quantity === undefined || typeof quantity !== 'number') {
      return res.status(400).json({ success: false, message: 'Quantity must be a number' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock`
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cartItem.quantity = quantity;
    await customer.save();

    const cart = await populatedCart(req.user._id);
    return res.status(200).json({ success: true, message: 'Quantity updated', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

/**
 * @desc   Remove product from cart
 * @route  DELETE /cart/:productId
 * @access Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    const cart = await populatedCart(req.user._id);
    return res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};
