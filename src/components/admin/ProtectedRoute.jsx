import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, superAdmin } = useAuthStore();
    const location = useLocation();

    // Check if authenticated and is a superAdmin
    if (!isAuthenticated || !superAdmin) {
        // Redirect to login but save current location for post-login redirect
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
