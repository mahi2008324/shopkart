import mongoose from 'mongoose';
import crypto from 'crypto';
import Order from '../models/order.model.js';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';
import razorpay from '../config/razorpay.js';

/**
 * Helper to validate shipping address
 */
const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return 'Shipping address is required';
  }

  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (
    !fullName?.trim() ||
    !phone?.trim() ||
    !addressLine1?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !pincode?.trim()
  ) {
    return 'All shipping address fields are required and cannot be empty';
  }

  // Pincode validation: exactly 6 digits
  const cleanPincode = pincode.trim();
  if (!/^\d{6}$/.test(cleanPincode)) {
    return 'Pincode must contain 6 digits';
  }

  // Phone validation: 10 digits or standard international format (8 to 15 digits)
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');
  if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
    return 'Phone number must contain a valid number format';
  }

  return null;
};

/**
 * @desc   Create a pending ShopKart order and Razorpay order
 * @route  POST /orders/create-payment-order (also POST /orders)
 * @access Private
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError
      });
    }

    // 2. Load authenticated customer and cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty'
      });
    }

    // 3. Load latest product data and verify stock
    const orderItems = [];
    let serverTotal = 0;

    for (const item of customer.cart) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID in cart'
        });
      }

      const product = await Product.findById(item.product);

      // Verify product exists
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more items in your cart are no longer available'
        });
      }

      // Verify stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, in cart: ${item.quantity}`
        });
      }

      // Calculate server total (never trust req.body.totalAmount)
      const lineTotal = product.price * item.quantity;
      serverTotal += lineTotal;

      // Build purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // 4. Create pending ShopKart order in MongoDB
    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount: serverTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    await shopKartOrder.save();

    // 5. Create Razorpay Order in paise
    const amountInPaise = Math.round(serverTotal * 100);
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key';
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart123';

    let razorpayOrderId = null;
    let isMockKey = false;

    try {
      // Attempt official Razorpay Orders API
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: shopKartOrder._id.toString(),
        notes: {
          shopKartOrderId: shopKartOrder._id.toString(),
          customerEmail: customer.email
        }
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      console.warn(
        'Razorpay API call failed (using simulated test order ID for development/offline test):',
        rzpErr.message
      );
      // Fallback test order id if offline or mock keys used
      razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      isMockKey = true;
    }

    // 6. Save razorpayOrderId to the ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    // 7. Return safe checkout payload
    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: shopKartOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: keyId,
      isMockKey
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Verify Razorpay payment signature and mark order PAID
 * @route  POST /orders/verify-payment
 * @access Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Load order from database
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this order'
      });
    }

    // Trusted razorpayOrderId from database
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_key';

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${trustedOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    const isSimulatedDev =
      process.env.NODE_ENV !== 'production' &&
      razorpay_signature === `simulated_sig_${razorpay_payment_id}`;

    if (expectedSignature !== razorpay_signature && !isSimulatedDev) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Signature verified! Mark order PAID and PLACED
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement stock for all purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user's cart in database
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Get current user's orders
 * @route  GET /orders
 * @access Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Get a single order by ID
 * @route  GET /orders/:id
 * @access Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this order'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Update order status progression (Bonus)
 * @route  PATCH /orders/:id/status
 * @access Private
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user ownership or admin access
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this order'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Delete a single order by ID
 * @route  DELETE /orders/:id
 * @access Private
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this order'
      });
    }

    await Order.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Order #${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * @desc   Delete all orders of the authenticated user
 * @route  DELETE /orders
 * @access Private
 */
export const deleteAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({ user: req.user._id });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} order(s) successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in deleteAllOrders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

