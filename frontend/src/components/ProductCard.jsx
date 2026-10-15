import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Tag,
  PackageCheck,
  AlertCircle,
  Heart,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialSaved = false, onWishlistChange }) => {
  const { _id, name, price, category, image, stock } = product;

  const { addItem, isInCart } = useCart();

  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMsg, setCartMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate clicks while request is running
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSaved) {
        // Remove from wishlist
        const res = await removeFromWishlist(_id);
        if (res.data && res.data.success) {
          setIsSaved(false);
          if (onWishlistChange) onWishlistChange(_id, false);
          window.dispatchEvent(new Event('wishlist-updated'));
        }
      } else {
        // Add to wishlist
        const res = await addToWishlist(_id);
        if (res.data && res.data.success) {
          setIsSaved(true);
          if (onWishlistChange) onWishlistChange(_id, true);
          window.dispatchEvent(new Event('wishlist-updated'));
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Already in wishlist (409 Conflict)
        setIsSaved(true);
        if (onWishlistChange) onWishlistChange(_id, true);
        window.dispatchEvent(new Event('wishlist-updated'));
      } else {
        const message =
          err.response?.data?.message || 'Unable to save product. Please try again.';
        setErrorMsg(message);
        setTimeout(() => setErrorMsg(null), 3500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartLoading || isOutOfStock) return;
    setCartLoading(true);
    setCartMsg(null);
    const result = await addItem(_id);
    if (!result.success) {
      setCartMsg(result.message || 'Could not add to cart');
      setTimeout(() => setCartMsg(null), 3500);
    }
    setCartLoading(false);
  };

  return (
    <div
      id={`product-card-${_id}`}
      className="card flex flex-col justify-between group overflow-hidden bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      {/* Product Image & Badges */}
      <div>
        <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden rounded-t-[1.1rem]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Category Chip */}
          <span className="absolute top-3 left-3 bg-white/85 backdrop-blur-md text-xs font-medium text-gray-700 px-2.5 py-1 rounded-full border border-white/60 flex items-center space-x-1 shadow-sm">
            <Tag className="w-3 h-3 text-indigo-500" />
            <span>{category}</span>
          </span>

          {/* Quick Heart Action on Image (Top Right) */}
          <button
            id={`quick-wishlist-${_id}`}
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            aria-label={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`press absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isSaved
                ? 'bg-white/95 text-rose-500 hover:bg-rose-50'
                : 'bg-white/80 text-gray-600 hover:text-rose-500 hover:bg-white'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            )}
          </button>
        </div>

        {/* Details */}
        <div className="p-4 pb-2">
          <h3
            className="text-base font-semibold text-title line-clamp-1 transition-colors duration-150"
            style={{ color: '#1d1d1f' }}
            title={name}
          >
            {name}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span
              className="text-lg font-bold"
              style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
            >
              {formattedPrice}
            </span>

            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                isOutOfStock
                  ? 'bg-red-50 text-red-600'
                  : stock < 5
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Out of stock</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-3 h-3" />
                  <span>{stock} left</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Error / cart notification banner */}
      {(errorMsg || cartMsg) && (
        <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-1.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorMsg || cartMsg}</span>
        </div>
      )}

      {/* Action Buttons: [ View Details ] [ ♡ Wishlist ] [ 🛒 Add to Cart ] */}
      <div className="p-4 pt-2 flex flex-col gap-2 border-t border-black/5 mt-2 bg-gray-50/40">
        <div className="grid grid-cols-2 gap-2">
          <Link
            id={`view-details-${_id}`}
            to={`/products/${_id}`}
            className="press inline-flex items-center justify-center space-x-1 px-3 py-2 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow"
            style={{ background: '#1d1d1f' }}
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            id={`btn-wishlist-${_id}`}
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            className={`press group/btn inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/70'
                : 'bg-white border-black/10 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Wishlisted</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 text-gray-500 group-hover/btn:text-rose-500" />
                <span>Wishlist</span>
              </>
            )}
          </button>
        </div>

        {/* Add to Cart — full width */}
        <button
          id={`btn-cart-${_id}`}
          type="button"
          onClick={handleAddToCart}
          disabled={cartLoading || isOutOfStock}
          className={`press w-full inline-flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
            isOutOfStock
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : isInCart(_id)
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {cartLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isInCart(_id) ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add Another</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
