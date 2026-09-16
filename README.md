# ShopKart 🛒

A full-stack e-commerce customer authentication and product catalog platform built with **React (Vite + Tailwind CSS v4)** on the frontend and **Node.js + Express + MongoDB** on the backend. Designed with an Apple-inspired minimalist design aesthetic and fluid micro-interactions.

---

## 🌟 Features

- **Authentication & Security**: JWT-based authentication using HttpOnly, Secure, cross-site cookies, bcrypt password hashing, and protected routes.
- **Customer Account & Settings**:
  - Dedicated `/account` profile page.
  - `/settings` page with tabs for viewing profile info and changing passwords.
  - Interactive profile dropdown in the navbar with outside-click detection.
- **Product Catalog**:
  - Real-time live search by product name and description.
  - Category filtering (Electronics, Fashion, Books, Home, etc.).
  - Price sorting (Low to High, High to Low).
  - Detailed product view with stock badges, responsive layout, and related recommendations.
  - Automatic MongoDB database seeding on first startup.
- **Apple Design Philosophy**:
  - Warm neutral background (`#F5F5F7`), translucent material blur headers, physics-based cubic-bezier transitions, and instant press feedback (`:active` scaling).
  - Full support for `prefers-reduced-motion` and `prefers-reduced-transparency`.
- **Production Ready**: Configured for split deployment (e.g. Backend on Render/Railway, Frontend on Vercel/Netlify).

---

## 📁 Project Structure

```
shopkart/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Customer & product route controllers
│   │   ├── models/           # Mongoose schemas (Customer, Product)
│   │   ├── routes/           # Express router endpoints
│   │   ├── middlewares/      # Auth protection middleware
│   │   ├── utils/            # DB connection, token generation, DNS resolver
│   │   └── data/             # Sample catalog seed data
│   ├── .env.example          # Environment variable template
│   ├── index.js              # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProductCard, SearchBar, Profile, etc.
│   │   ├── pages/            # Home, Products, ProductDetails, Account, Settings, Login, Register
│   │   ├── context/          # AuthContext provider
│   │   ├── services/         # Axios API client
│   │   └── index.css         # Apple design system & Tailwind v4 styles
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

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/shopkart.git
cd shopkart
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```
Update `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment Guide

### A. Deploy Backend to Render (Free)

1. Create a free account at [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default assigned by Render)
   - `MONGO_URI` = `your_mongodb_connection_string`
   - `JWT_SECRET` = `your_secret_key`
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app` (you can update this once frontend is deployed)
6. Click **Create Web Service**. Note your backend URL (e.g. `https://shopkart-api.onrender.com`).

---

### B. Deploy Frontend to Vercel (Free)

1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your `shopkart` GitHub repository.
4. In project configuration:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://shopkart-api.onrender.com` (your deployed backend URL without trailing slash)
6. Click **Deploy**.
7. Once deployed, copy your frontend URL (e.g. `https://shopkart.vercel.app`), go back to your backend on Render, and update `CLIENT_URL` to match your Vercel URL.
