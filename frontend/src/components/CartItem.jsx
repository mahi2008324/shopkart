import React, { useState } from 'react';
import { Trash2, Loader2, Minus, Plus, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { changeQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  const [qtyLoading, setQtyLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  };

  const handleIncrease = async () => {
    if (qtyLoading) return;
    setQtyLoading(true);
    const result = await changeQuantity(product._id, quantity + 1);
    if (!result.success) showError(result.message);
    setQtyLoading(false);
  };

  const handleDecrease = async () => {
    if (qtyLoading || quantity <= 1) return;
    setQtyLoading(true);
    const result = await changeQuantity(product._id, quantity - 1);
    if (!result.success) showError(result.message);
    setQtyLoading(false);
  };

  const handleRemove = async () => {
    if (removeLoading) return;
    setRemoveLoading(true);
    const result = await removeItem(product._id);
    if (!result.success) {
      showError(result.message);
      setRemoveLoading(false);
    }
    // If success, the item disappears from state — no need to unset loading
  };

  const lineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((product?.price ?? 0) * quantity);

  const unitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product?.price ?? 0);

  return (
    <div
      id={`cart-item-${product._id}`}
      className="bg-white rounded-2xl border border-black/6 shadow-sm p-4 flex gap-4 animate-fade-in"
    >
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80';
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3
            className="text-sm font-semibold text-title line-clamp-1"
            style={{ color: '#1d1d1f' }}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{unitPrice} each</p>

          {/* Stock warning */}
          {quantity >= product.stock && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Max stock reached
            </p>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3" /> {errorMsg}
            </p>
          )}
        </div>

        {/* Quantity controls + remove */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* [-] qty [+] */}
          <div className="flex items-center gap-2">
            <button
              id={`cart-decrease-${product._id}`}
              onClick={handleDecrease}
              disabled={qtyLoading || quantity <= 1}
              className="press w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 text-gray-700" />
            </button>

            <span className="w-8 text-center text-sm font-semibold" style={{ color: '#1d1d1f' }}>
              {qtyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500 mx-auto" />
              ) : (
                quantity
              )}
            </span>

            <button
              id={`cart-increase-${product._id}`}
              onClick={handleIncrease}
              disabled={qtyLoading || quantity >= product.stock}
              className="press w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>

          {/* Line total */}
          <span className="text-base font-bold" style={{ color: '#1d1d1f' }}>
            {lineTotal}
          </span>

          {/* Remove */}
          <button
            id={`cart-remove-${product._id}`}
            onClick={handleRemove}
            disabled={removeLoading}
            className="press inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {removeLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
