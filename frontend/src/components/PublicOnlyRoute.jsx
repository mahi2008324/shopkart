import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
