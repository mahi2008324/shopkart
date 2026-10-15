import React, { useState } from 'react';
import { createProduct } from '../services/api';
import {
  X,
  PackagePlus,
  DollarSign,
  Layers,
  Image as ImageIcon,
  FileText,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Home', 'Beauty', 'Sports'];

const AddProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') setImgError(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock cannot be negative.');
      return;
    }
    if (!formData.image.trim()) {
      setError('A valid product image URL is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: priceNum,
        stock: stockNum,
        image: formData.image.trim(),
        description: formData.description.trim(),
      };

      const res = await createProduct(payload);
      if (res.data?.success) {
        onProductCreated(res.data.product);
        onClose();
      } else {
        setError(res.data?.message || 'Failed to create product.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Something went wrong while creating the product.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-black/8 w-full max-w-xl overflow-hidden animate-scale-in z-10 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ background: '#1d1d1f' }}
            >
              <PackagePlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-headline text-lg font-bold" style={{ color: '#1d1d1f' }}>
                Add New Product
              </h2>
              <p className="text-caption text-xs text-gray-400">
                Create and publish an item to the ShopKart catalogue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="press p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50/80 border border-red-200/60 rounded-2xl flex items-center space-x-2.5 text-sm text-red-600 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="input-apple block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Category & Price (2 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-apple block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 cursor-pointer appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Price (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="price"
                  min="1"
                  step="any"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 2999"
                  className="input-apple block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock & Image URL (2 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="e.g. 25"
                className="input-apple block w-full px-3.5 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="input-apple block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Preview Thumbnail */}
          {formData.image.trim() && (
            <div className="flex items-center space-x-3 p-2.5 bg-gray-50 border border-black/6 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center shrink-0 border border-black/6">
                {!imgError ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700">Image Preview</p>
                <p className="text-xs text-gray-400 truncate">
                  {!imgError ? 'Image preview loaded' : 'Unable to load image from URL'}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <div className="relative">
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a clear and engaging description for this product..."
                className="input-apple block w-full px-3.5 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="press px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-black/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="press inline-flex items-center space-x-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl shadow-md hover:bg-gray-900 transition-colors disabled:opacity-50"
              style={{ background: '#1d1d1f' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4 text-indigo-400" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
