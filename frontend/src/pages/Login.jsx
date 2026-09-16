import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (result.success) {
        navigate('/home', { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Glassmorphism card */}
      <div className="max-w-md w-full space-y-7 bg-white/80 backdrop-blur-xl border border-black/6 p-8 rounded-3xl shadow-lg">

        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: '#1d1d1f' }}
          >
            <LogIn className="w-5 h-5" />
          </div>
          <h1
            className="text-headline text-2xl font-bold"
            style={{ color: '#1d1d1f' }}
          >
            Welcome back
          </h1>
          <p className="mt-1 text-body text-sm text-gray-500">
            Sign in to your ShopKart account
          </p>
        </div>

        {/* Success banner */}
        {successMessage && !errorMessage && (
          <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-100 flex items-start space-x-3 text-emerald-800 text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 p-3.5 border border-red-100 flex items-start space-x-3 text-red-800 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="input-apple block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-apple block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="press w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ background: '#1d1d1f' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-black/5">
          <p className="text-body text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#1d1d1f' }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
