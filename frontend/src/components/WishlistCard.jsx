import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PackageCheck, AlertCircle, ArrowRight, HeartCrack, Loader2 } from 'lucide-react';

const WishlistCard = ({ product, onRemove }) => {
  const { _id, name, price, category, image, stock } = product;
  const [isRemoving, setIsRemoving] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;

  const handleRemove = async (e) => {
    e.preventDefault();
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(_id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      id={`wishlist-card-${_id}`}
      className="card flex flex-col justify-between group overflow-hidden bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Product Image & Category */}
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
        </div>

        {/* Product Details */}
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
                  <span>{stock} units left</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-3 flex flex-col space-y-2 border-t border-black/5 mt-2 bg-gray-50/50">
        <Link
          id={`view-details-${_id}`}
          to={`/products/${_id}`}
          className="press w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-xl text-white shadow-sm hover:shadow transition-all"
          style={{ background: '#1d1d1f' }}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          id={`remove-wishlist-${_id}`}
          onClick={handleRemove}
          disabled={isRemoving}
          className="press w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRemoving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>Removing...</span>
            </>
          ) : (
            <>
              <HeartCrack className="w-4 h-4 text-rose-500" />
              <span>Remove from Wishlist</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
