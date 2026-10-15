import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';
import {
  CheckCircle,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle
} from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(id);
        if (res.data?.success) {
          setOrder(res.data.order);
        } else {
          setError(res.data?.message || 'Failed to load order details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-gray-500">Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl mx-auto flex items-center justify-center text-red-500">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#1d1d1f' }}>
          Unable to Find Order
        </h2>
        <p className="text-sm text-gray-500">{error || 'The requested order was not found.'}</p>
        <div className="pt-2">
          <Link
            to="/orders"
            className="press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ background: '#1d1d1f' }}
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(order.totalAmount);

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 sm:p-10 text-center space-y-6">
        {/* Animated Green Badge */}
        <div className="w-20 h-20 rounded-full mx-auto bg-emerald-50 text-emerald-600 flex items-center justify-center animate-scale-in">
          <CheckCircle className="w-12 h-12 stroke-[2.2]" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 mb-2">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-bold text-headline tracking-tight" style={{ color: '#1d1d1f' }}>
            Thank you for your order!
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Your payment has been verified and your order has been saved successfully in ShopKart.
          </p>
        </div>

        {/* Order Meta Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Order ID
            </p>
            <p
              id="order-success-id"
              className="text-sm font-mono font-semibold text-gray-900 truncate"
              title={order._id}
            >
              #{order._id}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Amount
            </p>
            <p id="order-success-total" className="text-sm font-bold text-gray-900">
              {formattedTotal}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </p>
            <span
              id="order-success-status"
              className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-0.5"
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Purchased Items Snapshot */}
        <div className="text-left space-y-3 pt-4 border-t border-black/6">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Purchased Items ({order.items.length})
          </h3>
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-black/4 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-200 shrink-0"
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
        </div>

        {/* Shipping Destination */}
        {order.shippingAddress && (
          <div className="text-left p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              Delivery Address
            </p>
            <p className="font-medium text-gray-900">
              {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            </p>
            <p className="text-xs text-gray-600">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-6 border-t border-black/6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            id="view-my-orders-btn"
            to="/orders"
            className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Package className="w-4 h-4" />
            View My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            id="continue-shopping-btn"
            to="/products"
            className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
