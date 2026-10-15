import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Package,
} from 'lucide-react';

const Cart = () => {
  const { cartItems, cartLoading, cartError, cartCount, cartSubtotal, refreshCart } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(cartSubtotal);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d1d1f' }} />
        <p className="text-sm font-medium text-gray-400">Loading your cart...</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (cartError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>
          Unable to load your cart.
        </h2>
        <p className="text-sm text-gray-400">Please check your connection and try again.</p>
        <button
          id="cart-retry-btn"
          onClick={refreshCart}
          className="press inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ background: '#1d1d1f' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <ShoppingCart className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-headline" style={{ color: '#1d1d1f' }}>
          Your cart is empty 🛒
        </h2>
        <p className="text-sm text-gray-400 max-w-sm">
          Looks like you haven't added anything yet. Browse the catalog and find something you'll love.
        </p>
        <Link
          id="cart-browse-btn"
          to="/products"
          className="press inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-2xl shadow-md"
          style={{ background: '#1d1d1f' }}
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ── Cart with items ────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-black/6">
        <h1
          className="text-3xl font-bold text-headline"
          style={{ color: '#1d1d1f' }}
        >
          My Cart
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cart Items List ── */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div
            className="sticky top-24 bg-white rounded-2xl border border-black/6 shadow-sm p-6 space-y-5"
          >
            <h2
              className="text-base font-semibold text-title"
              style={{ color: '#1d1d1f' }}
            >
              Order Summary
            </h2>

            {/* Line items summary */}
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate max-w-[140px]" title={item.product.name}>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 ml-2 font-medium" style={{ color: '#1d1d1f' }}>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/6 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Items</span>
                <span className="font-medium" style={{ color: '#1d1d1f' }}>{cartCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-xl font-bold" style={{ color: '#1d1d1f' }}>
                  {formattedSubtotal}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout button */}
            <Link
              id="proceed-to-checkout-btn"
              to="/checkout"
              className="press w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Package className="w-4 h-4" />
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-xs text-center text-gray-400">
              Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
