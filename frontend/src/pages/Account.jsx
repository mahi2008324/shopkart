import React from 'react';
import Profile from '../components/Profile';
import { User } from 'lucide-react';

/**
 * /account — Dedicated profile page.
 * Shows the user's full profile details.
 */
const Account = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page header */}
      <div className="flex items-center space-x-3">
        <div
          className="p-2.5 rounded-xl text-white"
          style={{ background: '#1d1d1f' }}
        >
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-headline text-2xl font-bold" style={{ color: '#1d1d1f' }}>
            My Profile
          </h1>
          <p className="text-caption text-sm text-gray-400 mt-0.5">
            Your personal account details
          </p>
        </div>
      </div>

      <Profile />
    </div>
  );
};

export default Account;
