import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile } from '../services/api';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const Profile = () => {
  const { user: initialUser } = useAuth();
  const [profile, setProfile] = useState(initialUser);
  const [loading, setLoading]   = useState(!initialUser);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await getCustomerProfile();
      setProfile(res.data);
      setError('');
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const name   = profile?.fullName || 'Customer';
  const email  = profile?.email    || 'N/A';
  const phone  = profile?.phone    || 'N/A';
  const id     = profile?._id      || 'N/A';

  const fields = [
    { icon: <User      className="w-4 h-4" />, label: 'Full Name',     value: name,  color: '#6366f1' },
    { icon: <Mail      className="w-4 h-4" />, label: 'Email Address', value: email, color: '#10b981' },
    { icon: <Phone     className="w-4 h-4" />, label: 'Phone Number',  value: phone, color: '#8b5cf6' },
    { icon: <ShieldCheck className="w-4 h-4" />, label: 'Status',    value: null,  color: '#f59e0b' },
  ];

  return (
    <div className="card p-7">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-black/5 mb-5">
        <div className="flex items-center space-x-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: '#1d1d1f' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-title text-xl font-bold" style={{ color: '#1d1d1f' }}>
              {name}
            </h2>
            <p className="text-caption text-xs text-gray-400 font-mono mt-0.5">ID: {id}</p>
          </div>
        </div>
        <button
          onClick={() => fetchProfile(true)}
          disabled={refreshing}
          className="press p-2 text-gray-400 hover:text-gray-700 hover:bg-black/5 rounded-xl transition-colors"
          title="Refresh profile"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="flex items-start space-x-3 p-4 rounded-2xl"
            style={{ background: 'var(--bg-page)' }}
          >
            <div className="p-2.5 bg-white rounded-xl shadow-sm" style={{ color }}>
              {icon}
            </div>
            <div>
              <p className="text-caption text-xs text-gray-400 uppercase tracking-wider font-medium">
                {label}
              </p>
              {value !== null ? (
                <p className="text-sm font-semibold mt-0.5" style={{ color: '#1d1d1f' }}>
                  {value}
                </p>
              ) : (
                <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Customer</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
