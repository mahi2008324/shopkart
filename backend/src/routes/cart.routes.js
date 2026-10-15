import { Router } from 'express';
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get('/',              getCart);
router.post('/:productId',   addToCart);
router.patch('/:productId',  updateCartQuantity);
router.delete('/:productId', removeFromCart);

export default router;
