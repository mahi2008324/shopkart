import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth protection to all order routes
router.use(protect);

// Order creation & payment
router.post('/create-payment-order', createPaymentOrder);
router.post('/', createPaymentOrder); // Alias for standard REST & test suite
router.post('/verify-payment', verifyPayment);

// Order queries
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// Order deletion
router.delete('/:id', deleteOrder);
router.delete('/', deleteAllOrders);

// Bonus: Order progression status update
router.patch('/:id/status', updateOrderStatus);

export default router;
