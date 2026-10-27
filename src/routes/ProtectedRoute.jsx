
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps routes that require authentication.
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *
 * With role restriction:
 *   <Route path="/admin" element={<ProtectedRoute allowedRoles={['team']}><Admin /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // 1. Still restoring session from storage — show loader
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // 2. Not logged in → redirect to /login, remember where they came from
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Logged in but role not allowed → redirect to /dashboard (or /unauthorized)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // 4. All good — render the protected page
    return children;
};

export default ProtectedRoute;