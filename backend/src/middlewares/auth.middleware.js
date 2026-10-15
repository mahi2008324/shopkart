import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing authentication token'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopkart_secret_key_12345'
    );

    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found'
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

export { protect };
