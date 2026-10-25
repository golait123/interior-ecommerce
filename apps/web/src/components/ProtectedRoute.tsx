import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Show security access denied toast notification once
    setTimeout(() => {
      toast.error('Access Denied: You do not have permissions for this protected area.', {
        id: 'access-denied-toast',
        icon: '🛡️',
        duration: 4000,
      });
    }, 50);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
