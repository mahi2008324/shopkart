import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Lock,
  Phone,
  User,
  Home,
  Building,
  Navigation,
  X
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, cartSubtotal, cartCount, clearCartState, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulatorData, setSimulatorData] = useState(null);

  // If cart is empty and not loading, inform user
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      // Cart is empty
    }
  }, [cartItems, cartLoading]);

  const validateField = (name, value) => {
    const trimmed = (value || '').trim();
    switch (name) {
      case 'fullName':
        if (!trimmed) return 'Full name is required';
        if (trimmed.length < 2) return 'Full name must be at least 2 characters';
        return null;
      case 'phone':
        if (!trimmed) return 'Phone number is required';
        if (!/^\+?\d{8,15}$/.test(trimmed.replace(/[\s-]/g, ''))) {
          return 'Please enter a valid phone number (8-15 digits)';
        }
        return null;
      case 'addressLine1':
        if (!trimmed) return 'Street address is required';
        return null;
      case 'city':
        if (!trimmed) return 'City is required';
        return null;
      case 'state':
        if (!trimmed) return 'State is required';
        return null;
      case 'pincode':
        if (!trimmed) return 'Pincode is required';
        if (!/^\d{6}$/.test(trimmed)) {
          return 'Pincode must contain 6 digits';
        }
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));

    // Real-time inline validation feedback
    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(shippingAddress).forEach((key) => {
      const err = validateField(key, shippingAddress[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    // 1. Client-side form validation
    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`shipping-${firstErrorKey}`);
      if (el) el.focus();
      return;
    }

    if (cartItems.length === 0) {
      setServerError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Call backend to validate stock, calculate total, and generate Razorpay Order
      const res = await createPaymentOrder({
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine1: shippingAddress.addressLine1.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim()
        }
      });

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || 'Failed to initialize order');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key, isMockKey } = res.data;

      // Check if real or mock Razorpay credentials are used
      const isPlaceholderKey =
        isMockKey ||
        !key ||
        key.includes('shopkart') ||
        key.includes('xxxx') ||
        key === 'rzp_test_shopkart123';

      if (isPlaceholderKey) {
        // Open the built-in interactive Razorpay Test Mode Simulator modal
        setIsSubmitting(false);
        setSimulatorData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
          currency,
          key
        });
        return;
      }

      // 3. Load Razorpay Checkout script for genuine Razorpay keys
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        // Fallback for sandboxed test environments if Razorpay CDN is unreachable
        console.warn('Razorpay script could not be loaded; initiating test verification modal');
        setIsSubmitting(false);
        setSimulatorData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
          currency,
          key
        });
        return;
      }

      // 4. Open Razorpay Standard Checkout modal
      const options = {
        key: key,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: user?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: async function (response) {
          // Received payment parameters from Razorpay Checkout
          await performPaymentVerification({
            shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setServerError('Payment checkout was dismissed. Your cart has been preserved.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        setIsSubmitting(false);
        setServerError(
          failResponse.error?.description ||
            'Payment failed. Your cart has been preserved. Please try again.'
        );
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || err.message || 'Error creating checkout order';
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  const handleSimulatorPay = async () => {
    if (!simulatorData) return;
    const paymentId = `pay_test_${Date.now()}`;
    await performPaymentVerification({
      shopKartOrderId: simulatorData.shopKartOrderId,
      razorpay_order_id: simulatorData.razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: `simulated_sig_${paymentId}`
    });
    setSimulatorData(null);
  };

  const handleSimulatorFail = () => {
    setSimulatorData(null);
    setServerError('Payment was cancelled / failed in Test Mode. Your cart has been preserved.');
  };

  const performPaymentVerification = async (paymentData) => {
    setIsVerifying(true);
    try {
      const verifyRes = await verifyPayment(paymentData);

      if (verifyRes.data && verifyRes.data.success) {
        // Clear global cart state in React
        clearCartState();
        // Redirect to Order Confirmation page
        navigate(`/order-success/${paymentData.shopKartOrderId}`);
      } else {
        throw new Error(verifyRes.data?.message || 'Payment signature verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      const msg =
        err.response?.data?.message || err.message || 'Payment verification failed';
      setServerError(msg);
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cartSubtotal);

  // If cart is empty
  if (cartItems.length === 0 && !isVerifying) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#1d1d1f' }}>
          Your Cart is Empty
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          You don't have any items in your cart to checkout. Add some items to proceed.
        </p>
        <Link
          id="checkout-back-to-products-btn"
          to="/products"
          className="press inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: '#1d1d1f' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="press inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headline tracking-tight" style={{ color: '#1d1d1f' }}>
          Checkout
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your delivery details and test payment to place your order.
        </p>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div
          id="checkout-error-banner"
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="text-sm">
            <span className="font-semibold">Checkout Notice: </span>
            {serverError}
          </div>
        </div>
      )}

      {/* Verifying overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
            <h3 className="text-lg font-bold" style={{ color: '#1d1d1f' }}>
              Verifying Payment...
            </h3>
            <p className="text-xs text-gray-500">
              Please wait while we verify your Razorpay payment signature and confirm your order.
            </p>
          </div>
        </div>
      )}

      {/* ── Razorpay Test Mode Simulator Modal ── */}
      {simulatorData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-black/10 animate-scale-in">
            {/* Header banner */}
            <div className="bg-[#0c2340] text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                    <span className="text-cyan-400">⚡</span> Razorpay
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                    Test Mode
                  </span>
                </div>
                <button
                  onClick={handleSimulatorFail}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg"
                  title="Close and keep cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-300">ShopKart Purchase</p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(simulatorData.amount / 100)}
                </p>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-indigo-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Razorpay Test Simulation
                </p>
                <p className="text-indigo-800 leading-relaxed text-[11px]">
                  Using test environment simulation. Completing this payment will verify HMAC signature, mark the order <strong>PAID</strong>, clear your cart, and redirect to Order Confirmation.
                </p>
              </div>

              {/* Order breakdown */}
              <div className="text-xs space-y-1.5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Customer:</span>
                  <span className="font-medium text-gray-900">{shippingAddress.fullName}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phone:</span>
                  <span className="font-medium text-gray-900">{shippingAddress.phone}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ShopKart Order ID:</span>
                  <span className="font-mono text-gray-900 font-medium">#{simulatorData.shopKartOrderId.slice(-8)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="simulator-pay-success-btn"
                  onClick={handleSimulatorPay}
                  className="press w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Successful Test Payment
                </button>

                <button
                  id="simulator-pay-fail-btn"
                  onClick={handleSimulatorFail}
                  className="press w-full py-2.5 px-4 rounded-xl font-medium text-xs text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                >
                  Simulate Payment Failure
                </button>
              </div>

              <p className="text-[11px] text-gray-400 text-center">
                Test Mode: No real money is charged · Verifies HMAC SHA-256 signature
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Shipping Form (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2.5 pb-4 border-b border-black/6 mb-6">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>
                  Shipping Details
                </h2>
                <p className="text-xs text-gray-400">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="shipping-fullName"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="shipping-fullName"
                    name="fullName"
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="shipping-phone"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="shipping-phone"
                    name="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label
                  htmlFor="shipping-addressLine1"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Address (House, Street, Area) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    id="shipping-addressLine1"
                    name="addressLine1"
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Flat 302, Green Avenue, MG Road"
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.addressLine1
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.addressLine1 && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City and State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label
                    htmlFor="shipping-city"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      id="shipping-city"
                      name="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Bengaluru"
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.city
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="shipping-state"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <input
                      id="shipping-state"
                      name="state"
                      type="text"
                      value={shippingAddress.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Karnataka"
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.state
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.state && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label
                  htmlFor="shipping-pincode"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Pincode (6 digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="shipping-pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 560001"
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.pincode
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.pincode && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.pincode}
                  </p>
                )}
              </div>

              {/* Test Mode Note */}
              <div className="pt-4 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Razorpay <strong>Test Mode</strong> is enabled. No real money will be charged.
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right Column: Order Summary (5 cols) ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-black/6 shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>
              Order Summary
            </h2>

            {/* Line items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center justify-between text-sm py-2 border-b border-black/4 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate" title={item.product.name}>
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal calculation */}
            <div className="border-t border-black/6 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Items ({cartCount})</span>
                <span className="font-medium text-gray-900">{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/6">
                <span className="text-base font-semibold" style={{ color: '#1d1d1f' }}>
                  Total Amount
                </span>
                <span className="text-2xl font-bold" style={{ color: '#1d1d1f' }}>
                  {formattedSubtotal}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              id="place-order-btn"
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isVerifying}
              className={`press w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold text-white rounded-2xl shadow-md transition-all ${
                isSubmitting || isVerifying
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:shadow-lg'
              }`}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {isSubmitting || isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Place Order & Pay</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit SSL encrypted checkout</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Prices and stock re-verified by server before payment initiation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
