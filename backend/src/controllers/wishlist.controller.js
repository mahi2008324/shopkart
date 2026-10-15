import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

/**
 * @desc    Add product to wishlist
 * @route   POST /wishlist/:productId
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Retrieve authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check for duplicate wishlist entry
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc    Get current user's wishlist
 * @route   GET /wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock'
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Filter out null references if a product was deleted from DB
    const populatedWishlist = (customer.wishlist || []).filter(
      (item) => item !== null
    );

    return res.status(200).json({
      success: true,
      count: populatedWishlist.length,
      wishlist: populatedWishlist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc    Toggle product in wishlist (Bonus Task 23)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Private
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index > -1) {
      customer.wishlist.splice(index, 1);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist'
      });
    } else {
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
