import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getWishlist } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import AddProductModal from '../components/AddProductModal';
import { Loader2, AlertCircle, ShoppingBag, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [savedProductIds, setSavedProductIds] = useState(new Set());

  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filters from the browser URL address bar
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';
  const searchParam = searchParams.get('search') || '';

  // Local state for the search input to keep typing responsive
  const [search, setSearch] = useState(searchParam);

  // Keep local search input synced if URL search param changes (e.g. browser back/forward or reset)
  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  // Debounce updating the URL search param when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const trimmed = search.trim();
        if (trimmed) {
          next.set('search', trimmed);
        } else {
          next.delete('search');
        }
        return next;
      }, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  const handleCategoryChange = (newCategory) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newCategory && newCategory !== 'All') {
        next.set('category', newCategory);
      } else {
        next.delete('category');
      }
      return next;
    }, { replace: true });
  };

  const handleSortChange = (newSort) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSort) {
        next.set('sort', newSort);
      } else {
        next.delete('sort');
      }
      return next;
    }, { replace: true });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
  };

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchParam.trim()) params.search = searchParam.trim();
      if (category && category !== 'All') params.category = category;
      if (sort) params.sort = sort;

      const res = await getProducts(params);
      if (res.data.success) {
        setProducts(res.data.products || []);
      } else {
        setError('Something went wrong while loading products.');
      }
    } catch {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [searchParam, category, sort]);

  const fetchWishlistIds = useCallback(async () => {
    try {
      const res = await getWishlist();
      if (res.data && res.data.success && Array.isArray(res.data.wishlist)) {
        setSavedProductIds(new Set(res.data.wishlist.map((item) => item._id)));
      }
    } catch {
      // Ignored if not authenticated or network error
    }
  }, []);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

  useEffect(() => {
    fetchWishlistIds();
    const handleUpdate = () => fetchWishlistIds();
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, [fetchWishlistIds]);

  const handleProductCreated = (newProduct) => {
    setSuccessBanner(`"${newProduct.name}" was added successfully to the catalogue!`);
    fetchProductsList();
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-emerald-800 text-sm font-medium animate-fade-in shadow-sm">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-black/6">
        <div>
          <h1
            className="text-headline text-3xl font-bold"
            style={{ color: '#1d1d1f' }}
          >
            Product Catalogue
          </h1>
          <p className="text-body text-sm text-gray-400 mt-1">
            Browse and discover items available on ShopKart
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div
            className="inline-flex items-center space-x-2 text-sm font-medium bg-white border border-black/6 px-3.5 py-2 rounded-xl shadow-sm"
            style={{ color: '#1d1d1f' }}
          >
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
            <span>
              <strong>{products.length}</strong> items
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="add-product-btn"
            className="press inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
            style={{ background: '#1d1d1f' }}
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={handleCategoryChange}
        sort={sort}
        setSort={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* Loading */}
      {loading && (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d1d1f' }} />
          <p className="text-sm font-medium text-gray-400">Loading products…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4 py-12 bg-white rounded-3xl border border-black/6 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>{error}</h3>
          <p className="text-sm text-gray-400 max-w-md">
            Please check your connection or retry.
          </p>
          <button
            onClick={fetchProductsList}
            className="press inline-flex items-center space-x-2 px-5 py-2.5 text-white font-medium text-sm rounded-xl shadow-sm"
            style={{ background: '#1d1d1f' }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 py-12 bg-white rounded-3xl border border-black/6 p-8 text-center">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>No products found</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Try adjusting your search or filter settings.
          </p>
          <button
            onClick={handleResetFilters}
            className="press px-4 py-2 text-white font-medium text-sm rounded-xl"
            style={{ background: '#1d1d1f' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initialSaved={savedProductIds.has(product._id)}
            />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default Products;
