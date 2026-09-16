import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  Grid,
  Loader2,
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProducts();
        if (res.data?.success) {
          setFeaturedProducts((res.data.products || []).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const customerName = user?.fullName || 'Customer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl text-white p-8 md:p-14"
        style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 50%, #1a1a2e 100%)' }}
      >
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest text-white/70">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product Discovery</span>
          </div>

          <h1
            className="text-display font-bold text-4xl md:text-5xl"
            style={{ color: '#f5f5f7' }}
          >
            Welcome back,{' '}
            <span style={{ color: '#a5b4fc' }}>{customerName}</span>
          </h1>

          <p className="text-body text-white/55 text-base md:text-lg max-w-lg">
            Discover our catalog with real-time search, category filters, and detailed product pages.
          </p>

          <Link
            to="/products"
            id="hero-browse-btn"
            className="press inline-flex items-center space-x-2 px-6 py-3 bg-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            style={{ color: '#1d1d1f' }}
          >
            <Grid className="w-4 h-4" />
            <span>Browse All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -top-8 w-40 h-40 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ── Featured Products ───────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline text-2xl font-bold" style={{ color: '#1d1d1f' }}>
                Featured Products
              </h2>
              <p className="text-caption text-sm text-gray-400 mt-0.5">
                Handpicked from our catalog
              </p>
            </div>
            <Link
              to="/products"
              id="featured-view-all-link"
              className="press inline-flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
