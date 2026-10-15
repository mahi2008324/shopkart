# ShopKart 🛒

A modern, full-stack e-commerce customer authentication, shopping cart, order management, and product catalog platform built with **React (Vite + Tailwind CSS v4)** on the frontend and **Node.js + Express + MongoDB** on the backend. Designed with an Apple-inspired minimalist design aesthetic, fluid physics-based micro-interactions, and secure payments via Razorpay.

---

## 🌟 Key Features

- **Authentication & Security**:
  - Secure JWT authentication using `HttpOnly`, `Secure`, `SameSite` cookies.
  - Salted `bcrypt` password hashing.
  - Route protection middlewares for authenticated customer actions.
- **Customer Account & Settings**:
  - Dedicated `/account` profile page with personal info and order shortcuts.
  - `/settings` page with tabs for managing profile info and password updates.
  - Interactive profile dropdown menu in the navbar with outside-click detection.
- **Product Catalog & Management**:
  - Real-time live search across product titles and descriptions.
  - Instant category filtering (Electronics, Fashion, Books, Home, etc.).
  - Price sorting (Low to High, High to Low).
  - Modal to add new products to the catalog with real-time refresh.
  - Automated database seeding on first startup (with fallback in-memory MongoDB support).
- **Shopping Cart & Wishlist**:
  - Persistent shopping cart backed by MongoDB with real-time subtotal calculation.
  - Instant quantity updates, single-item removal, and empty-cart guards.
  - Dedicated Wishlist toggle and `/wishlist` management page.
- **Checkout & Razorpay Payments**:
  - Multi-field shipping address validation (name, phone, address, city, state, 6-digit pincode).
  - Server-calculated total validation to prevent client-side price tampering.
  - Razorpay order creation and HMAC SHA256 cryptographic signature verification.
  - Instant cart clearance upon verified payment and transition to order confirmation.
- **Order Tracking & History**:
  - Order history page (`/orders`) with product snapshots (name, image, purchase price).
  - Order success receipt page (`/order-success/:id`).
  - Owner-based access protection preventing unauthorized order access.
  - Order status tracking (`PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).
- **Apple Design Philosophy**:
  - Clean neutral canvas (`#F5F5F7`), translucent glassmorphism blur headers (`backdrop-blur-md`).
  - Physical spring transitions, subtle card elevations, and tactile press scaling (`:active`).
  - Native support for `prefers-reduced-motion` and `prefers-reduced-transparency`.

---

## 📁 Project Structure

```
shopkart/
├── backend/
│   ├── config/               # Configuration aliases (Razorpay)
│   ├── src/
│   │   ├── config/           # Razorpay SDK initialization
│   │   ├── controllers/      # Customer, Product, Cart, Wishlist, Order controllers
│   │   ├── models/           # Mongoose schemas (Customer, Product, Order)
│   │   ├── routes/           # Express router endpoints (/customers, /products, /cart, /wishlist, /orders)
│   │   ├── middlewares/      # Auth verification & error handling
│   │   ├── utils/            # DB connection, JWT generation, DNS resolver
│   │   └── data/             # Curated catalog seed dataset
│   ├── seed.js               # CLI database seeding script
│   ├── test-lab06.js         # Automated end-to-end test suite
│   ├── .env.example          # Environment variable template
│   ├── index.js              # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProductCard, CartItem, WishlistCard, AddProductModal, etc.
│   │   ├── pages/            # Home, Products, ProductDetails, Cart, Checkout, Orders, Wishlist, Account, Settings, Login, Register
│   │   ├── context/          # AuthContext & CartContext providers
│   │   ├── services/         # Axios API client with interceptors
│   │   └── index.css         # Apple design system & Tailwind v4 styling
│   ├── public/
│   │   └── _redirects        # Netlify SPA routing fallback
│   ├── vercel.json           # Vercel SPA routing fallback
│   ├── .env.example          # Frontend environment variable template
│   ├── vite.config.js        # Vite + Tailwind v4 plugin config
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/mahi2008324/shopkart.git
cd shopkart
```

### 2. Configure & Run Backend
```bash
cd backend
npm install
cp .env.example .env
```
Update `backend/.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend:
```bash
npm run dev
```
*(The backend will connect to MongoDB and automatically seed initial sample products if the catalog is empty).*

### 3. Configure & Run Frontend
In a second terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```
Start the Vite development server:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing

The backend includes an automated test suite verifying auth, cart behavior, order creation, and payment signature verification:
```bash
cd backend
node test-lab06.js
```

---

## 🚢 Deployment Guide

### A. Deploy Backend to Render (Free)
1. Sign in to [Render.com](https://render.com).
2. Click **New +** → **Web Service** and connect your GitHub repository `shopkart`.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGO_URI` = `<your MongoDB Atlas connection string>`
   - `JWT_SECRET` = `<your random secret key>`
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `https://<your-frontend-app>.vercel.app`
   - `RAZORPAY_KEY_ID` = `<your test key>`
   - `RAZORPAY_KEY_SECRET` = `<your test secret>`
5. Click **Create Web Service** and note your URL (e.g., `https://shopkart-backend.onrender.com`).

---

### B. Deploy Frontend to Vercel (Free)
1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project** and import `shopkart`.
3. In Project Settings:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**:
   - `VITE_API_URL` = `https://shopkart-backend.onrender.com` (backend URL without trailing slash)
5. Click **Deploy**.
6. Once deployed, copy your live Vercel URL and update `CLIENT_URL` in your Render backend settings.

---

## 🔒 Security Best Practices
- No `.env` files, production database credentials, or secret keys are committed.
- Sensitive environment variables are documented only in `.env.example`.
- Cookies use `HttpOnly` and `SameSite` to prevent XSS credential exfiltration.
