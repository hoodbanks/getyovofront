import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const RiderPublicRoute = ({ children }) => {
    const { isAuthenticated, rider } = useAuthStore();
    const location = useLocation();

    // Check if authenticated and is a rider
    if (isAuthenticated && rider) {
        // Redirect to dashboard if trying to access auth pages while logged in
        const from = location.state?.from?.pathname || '/rider/app/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
};

export default RiderPublicRoute;
