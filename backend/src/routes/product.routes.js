import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  seedProducts
} from '../controllers/product.controller.js';

const router = Router();

router.post('/seed', seedProducts);
router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
