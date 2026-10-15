import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Account from './pages/Account';
import SettingsPage from './pages/Settings';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <Navbar />
      {/* key re-mounts page on route change → triggers animate-fade-up */}
      <main className="flex-1 animate-fade-up" key={location.pathname}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Guest only */}
          <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Protected */}
          <Route path="/home"             element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products"         element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/products/:id"     element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/wishlist"         element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/cart"             element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout"         element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders"           element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id"       element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/account"          element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/settings"         element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
