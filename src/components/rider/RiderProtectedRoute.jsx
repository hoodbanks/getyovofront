import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const RiderProtectedRoute = ({ children }) => {
    const { isAuthenticated, rider } = useAuthStore();
    const location = useLocation();

    // Check if authenticated and is a rider
    if (!isAuthenticated || !rider) {
        // Redirect to login but save current location for post-login redirect
        return <Navigate to="/rider/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RiderProtectedRoute;
