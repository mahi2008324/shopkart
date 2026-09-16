import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, PackageCheck, AlertCircle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const isOutOfStock = stock <= 0;

  return (
    <div className="card flex flex-col justify-between group overflow-hidden">
      {/* Image */}
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
          {/* Frosted category chip */}
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-700 px-2.5 py-1 rounded-full border border-white/60 flex items-center space-x-1 shadow-sm">
            <Tag className="w-3 h-3 text-indigo-500" />
            <span>{category}</span>
          </span>
        </div>

        {/* Details */}
        <div className="p-4 pb-2">
          <h3
            className="text-base font-semibold text-title line-clamp-1 transition-colors duration-150"
            style={{ color: '#1d1d1f' }}
          >
            {name}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}>
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

      {/* Action */}
      <div className="px-4 pb-4 pt-2">
        <Link
          to={`/products/${_id}`}
          className="press w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          style={{ background: '#1d1d1f' }}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
