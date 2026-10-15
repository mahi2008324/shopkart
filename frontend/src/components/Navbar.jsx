import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlist } from '../services/api';
import {
  ShoppingBag,
  LogOut,
  LogIn,
  UserPlus,
  Grid,
  Home as HomeIcon,
  User,
  Settings,
  ChevronDown,
  Heart,
  ShoppingCart,
  Package,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchWishlistCount = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await getWishlist();
      if (res.data && res.data.success) {
        setWishlistCount(res.data.count ?? (res.data.wishlist?.length || 0));
      }
    } catch {
      // Ignored
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistCount();
    const handler = () => fetchWishlistCount();
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, [fetchWishlistCount]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 press ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 material border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <Link
            to={user ? '/home' : '/login'}
            className="flex items-center space-x-2 group press"
          >
            <div
              className="p-2 rounded-xl text-white shadow-sm"
              style={{ background: '#1d1d1f' }}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-headline" style={{ color: '#1d1d1f' }}>
              Shop<span style={{ color: '#6366f1' }}>Kart</span>
            </span>
          </Link>

          {/* Nav links (authenticated) */}
          {user && (
            <nav className="hidden md:flex items-center p-1 rounded-xl border border-black/6 bg-white/50">
              <NavLink to="/home"     className={navLinkClass}>
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                <Grid className="w-4 h-4" />
                <span>Products</span>
              </NavLink>
              <NavLink id="navbar-wishlist-link" to="/wishlist" className={navLinkClass}>
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : '(0)'}</span>
              </NavLink>
              <NavLink id="navbar-cart-link" to="/cart" className={navLinkClass}>
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
                <span>Cart ({cartCount})</span>
              </NavLink>
              <NavLink id="navbar-orders-link" to="/orders" className={navLinkClass}>
                <Package className="w-4 h-4 text-emerald-500" />
                <span>Orders</span>
              </NavLink>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {user ? (
              /* ── Profile Dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  id="navbar-profile-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="press flex items-center space-x-2 bg-black/5 hover:bg-black/8 px-3 py-1.5 rounded-full transition-colors"
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                    style={{ background: '#1d1d1f' }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    className="hidden sm:inline-block max-w-[120px] truncate text-sm font-medium text-caption"
                    style={{ color: '#1d1d1f' }}
                  >
                    {user.fullName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="dropdown-menu animate-scale-in absolute right-0 mt-2 w-52 py-1.5 z-50">
                    {/* User info header */}
                    <div className="px-4 py-2.5 border-b border-black/6 mb-1">
                      <p className="text-xs font-semibold" style={{ color: '#1d1d1f' }}>
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    </div>

                    {/* Wishlist */}
                    <Link
                      id="dropdown-wishlist-link"
                      to="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors rounded-lg mx-1"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                    </Link>

                    {/* Cart */}
                    <Link
                      id="dropdown-cart-link"
                      to="/cart"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors rounded-lg mx-1"
                    >
                      <ShoppingCart className="w-4 h-4 text-indigo-500" />
                      <span>Cart ({cartCount})</span>
                    </Link>

                    {/* My Orders */}
                    <Link
                      id="dropdown-orders-link"
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors rounded-lg mx-1"
                    >
                      <Package className="w-4 h-4 text-emerald-500" />
                      <span>My Orders</span>
                    </Link>

                    {/* My Profile */}
                    <Link
                      id="dropdown-profile-link"
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors rounded-lg mx-1"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>

                    {/* Settings */}
                    <Link
                      id="dropdown-settings-link"
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 hover:text-gray-900 transition-colors rounded-lg mx-1"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-black/6 my-1.5 mx-2" />

                    {/* Logout */}
                    <button
                      id="dropdown-logout-btn"
                      onClick={handleLogout}
                      className="press w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg mx-1 text-left"
                      style={{ width: 'calc(100% - 8px)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  id="navbar-login-link"
                  to="/login"
                  className="press inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-black/5 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  id="navbar-register-link"
                  to="/register"
                  className="press inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm"
                  style={{ background: '#1d1d1f' }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
