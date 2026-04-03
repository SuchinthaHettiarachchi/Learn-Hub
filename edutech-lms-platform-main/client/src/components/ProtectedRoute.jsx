/**
 * ProtectedRoute Component
 * 
 * Route guard that restricts access based on authentication and role.
 * 
 * Behavior:
 *   - While loading: Shows loading spinner
 *   - No user: Redirects to /login
 *   - adminOnly=true && !isAdmin: Redirects to /
 *   - Otherwise: Renders children
 * 
 * Usage:
 *   <ProtectedRoute>           — Any authenticated user
 *   <ProtectedRoute adminOnly> — Admin users only
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';


export function ProtectedRoute({ children, adminOnly = false }) {

  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

