import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';
import {
  Heart,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);

  const fetchWishlistItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWishlist();
      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        setError("We couldn't load your wishlist.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await removeFromWishlist(productId);
      if (response.data && response.data.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        window.dispatchEvent(new Event('wishlist-updated'));
        setBanner({
          type: 'success',
          message: 'Product removed from your wishlist.'
        });
        setTimeout(() => setBanner(null), 3000);
      }
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove product. Please try again.'
      });
      setTimeout(() => setBanner(null), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
      {/* Toast Banner */}
      {banner && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium shadow-sm transition-all animate-fade-in ${
            banner.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      {/* ── 1. LOADING STATE ── */}
      {loading && (
        <div
          id="wishlist-loading-state"
          className="min-h-[55vh] flex flex-col items-center justify-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-rose-600 absolute -top-1 -right-1" />
          </div>
          <p className="text-base font-medium text-gray-600">
            Loading your wishlist...
          </p>
        </div>
      )}

      {/* ── 2. ERROR STATE ── */}
      {!loading && error && (
        <div
          id="wishlist-error-state"
          className="max-w-lg mx-auto py-16 text-center"
        >
          <div className="card p-8 sm:p-10 space-y-5 bg-white rounded-3xl border border-red-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-headline mb-2"
                style={{ color: '#1d1d1f' }}
              >
                Something went wrong.
              </h2>
              <p className="text-sm text-gray-500">
                {error || "We couldn't load your wishlist."}
              </p>
            </div>
            <button
              id="wishlist-try-again-btn"
              onClick={fetchWishlistItems}
              className="press inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm hover:shadow transition-all"
              style={{ background: '#1d1d1f' }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 3. EMPTY STATE ── */}
      {!loading && !error && wishlist.length === 0 && (
        <div
          id="wishlist-empty-state"
          className="max-w-md mx-auto py-16 text-center animate-fade-up"
        >
          <div className="card p-8 sm:p-12 space-y-6 bg-white rounded-3xl border border-black/5 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h2
                className="text-2xl font-bold text-headline"
                style={{ color: '#1d1d1f' }}
              >
                Your wishlist is empty
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Save products you love and find them here later.
              </p>
            </div>

            <div>
              <Link
                id="browse-products-empty-btn"
                to="/products"
                className="press inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm text-white shadow-sm hover:shadow transition-all"
                style={{ background: '#1d1d1f' }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. POPULATED WISHLIST ── */}
      {!loading && !error && wishlist.length > 0 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-black/5">
            <div>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                <h1
                  className="text-2xl sm:text-3xl font-bold text-headline"
                  style={{ color: '#1d1d1f' }}
                >
                  My Wishlist
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
              </p>
            </div>

            <Link
              to="/products"
              className="press inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
