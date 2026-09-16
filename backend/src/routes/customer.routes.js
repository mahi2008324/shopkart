import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword
} from '../controllers/customer.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protect, getProfile);
router.post('/logout', protect, logoutCustomer);
router.patch('/change-password', protect, changePassword);

export default router;
