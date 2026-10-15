import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import {
  ArrowLeft,
  ShoppingBag,
  Tag,
  PackageCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistBanner, setWishlistBanner] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductById(id);
        if (res.data.success && res.data.product) {
          setProduct(res.data.product);
          // Check if product is in wishlist
          try {
            const wishRes = await getWishlist();
            if (wishRes.data && wishRes.data.success && Array.isArray(wishRes.data.wishlist)) {
              setIsWishlisted(wishRes.data.wishlist.some((item) => item._id === id));
            }
          } catch {
            // Ignored
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistBanner(null);
    try {
      if (isWishlisted) {
        const res = await removeFromWishlist(id);
        if (res.data && res.data.success) {
          setIsWishlisted(false);
          window.dispatchEvent(new Event('wishlist-updated'));
          setWishlistBanner({ type: 'info', text: 'Removed from your wishlist' });
          setTimeout(() => setWishlistBanner(null), 3000);
        }
      } else {
        const res = await addToWishlist(id);
        if (res.data && res.data.success) {
          setIsWishlisted(true);
          window.dispatchEvent(new Event('wishlist-updated'));
          setWishlistBanner({ type: 'success', text: 'Added to your wishlist!' });
          setTimeout(() => setWishlistBanner(null), 3000);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        window.dispatchEvent(new Event('wishlist-updated'));
      } else {
        setWishlistBanner({
          type: 'error',
          text: err.response?.data?.message || 'Unable to update wishlist. Please try again.'
        });
        setTimeout(() => setWishlistBanner(null), 3500);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d1d1f' }} />
        <p className="text-sm text-gray-400 font-medium">Fetching product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="card p-8 space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-title text-2xl font-bold" style={{ color: '#1d1d1f' }}>Product Not Found</h2>
          <p className="text-body text-sm text-gray-400 max-w-md mx-auto">
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <Link
            to="/products"
            className="press inline-flex items-center space-x-2 px-5 py-2.5 text-white font-medium text-sm rounded-xl shadow-sm"
            style={{ background: '#1d1d1f' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;
  const isOutOfStock = stock <= 0;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="press inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Cart toast */}
      {addedToCart && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm font-medium shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>"{name}" added to cart (UI preview).</span>
        </div>
      )}

      {/* Wishlist toast */}
      {wishlistBanner && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 text-sm font-medium shadow-sm animate-fade-in ${
            wishlistBanner.type === 'success'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : wishlistBanner.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-gray-100 border border-gray-200 text-gray-800'
          }`}
        >
          {wishlistBanner.type === 'success' ? (
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 shrink-0" />
          ) : wishlistBanner.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" />
          )}
          <span>{wishlistBanner.text}</span>
        </div>
      )}

      {/* Main layout */}
      <div className="card p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">

        {/* Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-black/5 bg-gray-50 group">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {/* Frosted category chip */}
          <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1.5 rounded-full border border-white/60 flex items-center space-x-1.5 shadow-sm">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>{category}</span>
          </span>

          {/* Quick Heart on Image */}
          <button
            id="detail-image-wishlist-btn"
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`press absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isWishlisted
                ? 'bg-white/95 text-rose-500 hover:bg-rose-50'
                : 'bg-white/80 text-gray-600 hover:text-rose-500 hover:bg-white'
            }`}
          >
            {wishlistLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                  isOutOfStock
                    ? 'bg-red-50 text-red-600'
                    : stock < 5
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isOutOfStock ? (
                  <><AlertCircle className="w-3.5 h-3.5" /><span>Out of Stock</span></>
                ) : (
                  <><PackageCheck className="w-3.5 h-3.5" /><span>In Stock ({stock})</span></>
                )}
              </span>
              <span className="text-caption text-xs text-gray-400 font-mono">
                ID: {product._id}
              </span>
            </div>

            <h1
              className="text-title text-3xl font-bold leading-tight"
              style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}
            >
              {name}
            </h1>

            <div
              className="text-3xl font-bold"
              style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}
            >
              {formattedPrice}
            </div>

            <div className="border-t border-black/5 pt-4">
              <h3 className="text-caption text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-body text-base text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Value props + CTA */}
          <div className="space-y-4 border-t border-black/5 pt-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Truck className="w-4 h-4 text-indigo-500" />, label: 'Fast Delivery' },
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, label: 'Verified Quality' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center space-x-2 p-3 rounded-xl text-sm font-medium text-gray-600"
                  style={{ background: 'var(--bg-page)' }}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`press w-full py-3.5 px-5 rounded-2xl font-semibold text-base flex items-center justify-center space-x-2.5 shadow-sm transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'text-white hover:shadow-md'
                }`}
                style={!isOutOfStock ? { background: '#1d1d1f' } : {}}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}</span>
              </button>

              <button
                id="detail-wishlist-toggle-btn"
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`press w-full py-3.5 px-5 rounded-2xl font-semibold text-base flex items-center justify-center space-x-2.5 transition-all border ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/70'
                    : 'bg-white border-black/10 text-gray-800 hover:bg-gray-50'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {wishlistLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    <span>Saving...</span>
                  </>
                ) : isWishlisted ? (
                  <>
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    <span>In Wishlist</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 text-gray-500" />
                    <span>Add to Wishlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
