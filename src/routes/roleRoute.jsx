
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute
 * Wraps routes that require a specific role.
 *
 * Usage:
 *   <Route path="/scout-tools" element={<RoleRoute allowedRoles={['scout']}><ScoutTools /></RoleRoute>} />
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleRoute;