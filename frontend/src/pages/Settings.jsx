import React, { useState } from 'react';
import Profile from '../components/Profile';
import { changeCustomerPassword } from '../services/api';
import {
  Settings as SettingsIcon,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';

const TABS = [
  { id: 'profile',  label: 'Profile',          icon: User     },
  { id: 'security', label: 'Account Settings',  icon: KeyRound },
];

/**
 * /settings — Account settings page.
 * Tabs: Profile view | Account Settings (change password)
 */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData]     = useState({ oldPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: '', error: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, success: '', error: '' });

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordStatus({ loading: false, success: '', error: 'Both fields are required.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ loading: false, success: '', error: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      const res = await changeCustomerPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        setPasswordStatus({ loading: false, success: 'Password changed successfully!', error: '' });
        setPasswordData({ oldPassword: '', newPassword: '' });
      } else {
        setPasswordStatus({ loading: false, success: '', error: res.data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Incorrect password or request failed.',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Page header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl text-white" style={{ background: '#1d1d1f' }}>
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-headline text-2xl font-bold" style={{ color: '#1d1d1f' }}>Settings</h1>
          <p className="text-caption text-sm text-gray-400 mt-0.5">Manage your account and security</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center space-x-1 bg-black/5 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`settings-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`press inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && <Profile />}

      {/* Tab: Account Settings (change password) */}
      {activeTab === 'security' && (
        <div className="card p-7 space-y-6">
          {/* Section header */}
          <div className="pb-5 border-b border-black/5">
            <h2 className="text-title text-lg font-bold flex items-center space-x-2" style={{ color: '#1d1d1f' }}>
              <KeyRound className="w-5 h-5 text-indigo-500" />
              <span>Change Password</span>
            </h2>
            <p className="text-caption text-sm text-gray-400 mt-1">
              Update your account password. You'll need your current password to confirm.
            </p>
          </div>

          {/* Status banners */}
          {passwordStatus.success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordStatus.success}</span>
            </div>
          )}
          {passwordStatus.error && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordStatus.error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            {[
              { field: 'oldPassword', label: 'Current Password', placeholder: '••••••••' },
              { field: 'newPassword', label: 'New Password',     placeholder: 'At least 6 characters' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id={`settings-${field}`}
                    type="password"
                    value={passwordData[field]}
                    onChange={(e) => setPasswordData({ ...passwordData, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="input-apple block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm placeholder-gray-400"
                  />
                </div>
              </div>
            ))}

            <button
              id="settings-change-password-btn"
              type="submit"
              disabled={passwordStatus.loading}
              className="press flex items-center space-x-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50"
              style={{ background: '#1d1d1f' }}
            >
              {passwordStatus.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating…</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
