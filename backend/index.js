import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

import customerRoutes from './src/routes/customer.routes.js';
import productRoutes from './src/routes/product.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import connectDB from './src/utils/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (clientUrls.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'ShopKart API is running' });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`)
});

export default app;
