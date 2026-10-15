import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, updateOrderStatus } from '../services/api';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Sparkles
} from 'lucide-react';

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyOrders();
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      } else {
        setError(res.data?.message || 'Failed to load orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Bonus challenge: status progression handler
  const handleStatusProgression = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PLACED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-44 bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-black/6 p-6 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="h-16 bg-gray-100 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl mx-auto flex items-center justify-center text-red-500">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#1d1d1f' }}>
          Unable to Load Orders
        </h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchOrders}
          className="press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: '#1d1d1f' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ──
  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div
          className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#1d1d1f' }}>
          You have not placed any orders yet.
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          When you place an order, all your purchases and delivery updates will appear here.
        </p>
        <div>
          <Link
            id="start-shopping-btn"
            to="/products"
            className="press inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-black/6">
        <div>
          <h1 className="text-3xl font-bold text-headline tracking-tight" style={{ color: '#1d1d1f' }}>
            My Orders
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and view details of your previous {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <Link
          to="/products"
          className="press inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrders[order._id];
          const formattedTotal = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(order.totalAmount);

          const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          const currentStepIdx = ORDER_STEPS.indexOf(order.status);

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Order Card Header */}
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {orderDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="text-xl font-bold" style={{ color: '#1d1d1f' }}>
                      {formattedTotal}
                    </p>
                  </div>
                </div>

                {/* ── Bonus: Visual Status Progression Stepper ── */}
                {order.status !== 'PENDING_PAYMENT' && (
                  <div className="py-4 border-y border-black/4">
                    <div className="flex items-center justify-between relative">
                      {/* Connecting line */}
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-0" />
                      <div
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-500 -z-0"
                        style={{
                          width: `${Math.max(0, (currentStepIdx / (ORDER_STEPS.length - 1)) * 100)}%`
                        }}
                      />

                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-50'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold mt-1.5 uppercase tracking-wider ${
                                isCurrent
                                  ? 'text-indigo-600 font-bold'
                                  : isDone
                                  ? 'text-gray-700'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bonus: Dev Simulator status selector */}
                    <div className="mt-4 pt-3 flex flex-wrap items-center justify-end gap-2 text-xs">
                      <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Bonus Status Simulation:
                      </span>
                      {ORDER_STEPS.map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusProgression(order._id, st)}
                          disabled={updatingOrderId === order._id || order.status === st}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors ${
                            order.status === st
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 cursor-default'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Summary list */}
                <div className="space-y-2">
                  {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-gray-50/70"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity} ×{' '}
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0
                            }).format(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 shrink-0">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* More items indicator */}
                {!isExpanded && order.items.length > 2 && (
                  <p className="text-xs text-gray-400 italic">
                    +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                  </p>
                )}

                {/* Expanded Details: Shipping + Payment ID */}
                {isExpanded && (
                  <div className="pt-4 border-t border-black/4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fade-in">
                    {order.shippingAddress && (
                      <div className="p-3 rounded-xl bg-gray-50 space-y-1">
                        <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          Shipping Address
                        </p>
                        <p className="text-gray-900 font-medium">
                          {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                        </p>
                        <p className="text-gray-500">
                          {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-gray-50 space-y-1">
                      <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        Payment Details
                      </p>
                      <p className="text-gray-500">
                        Status:{' '}
                        <strong className="text-emerald-600">{order.paymentStatus}</strong>
                      </p>
                      {order.razorpayPaymentId && (
                        <p className="text-gray-500 font-mono">
                          Payment ID: {order.razorpayPaymentId}
                        </p>
                      )}
                      {order.razorpayOrderId && (
                        <p className="text-gray-500 font-mono">
                          Rzp Order ID: {order.razorpayOrderId}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Expand / Details Toggle Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => toggleExpand(order._id)}
                    className="press inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
