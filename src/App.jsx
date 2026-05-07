import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import Customers from './pages/admin/Customers';
import Vendors from './pages/admin/Vendors';
import Riders from './pages/admin/Riders';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import Settings from './pages/admin/Settings';
import PushNotifications from './pages/admin/PushNotifications';

import Login from './pages/admin/auth/Login';
import ForgotPassword from './pages/admin/auth/ForgotPassword';
import VerifyEmail from './pages/admin/auth/VerifyEmail';
import ResetPassword from './pages/admin/auth/ResetPassword';
import ResetSuccess from './pages/admin/auth/ResetSuccess';
import Home from './pages/Home';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import MobilePrivacyPolicy from './pages/legal/MobilePrivacyPolicy';
import MobileTermsAndConditions from './pages/legal/MobileTermsAndConditions';
import DeleteAccount from './pages/account/DeleteAccount';
import MobileDeleteAccount from './pages/account/MobileDeleteAccount';
import { Toaster } from 'sonner';




// Rider Pages
import RiderWelcome from './pages/rider/onboarding/RiderWelcome';
import RiderLogin from './pages/rider/auth/RiderLogin';
import RiderForgotPassword from './pages/rider/auth/RiderForgotPassword';
import RiderVerifyOtp from './pages/rider/auth/RiderVerifyOtp';
import RiderResetPassword from './pages/rider/auth/RiderResetPassword';
import RiderSuccessState from './pages/rider/auth/RiderSuccessState';
import RiderLayout from './components/rider/RiderLayout';
import RiderProtectedRoute from './components/rider/RiderProtectedRoute';
import RiderPublicRoute from './components/rider/RiderPublicRoute';
import RiderDashboard from './pages/rider/dashboard/RiderDashboard';
import OrderDetails from './pages/rider/dashboard/OrderDetails';
import ActiveOrder from './pages/rider/dashboard/ActiveOrder';
import RiderHistory from './pages/rider/history/RiderHistory';
import RiderProfile from './pages/rider/profile/RiderProfile';
import RiderProfileForgotPassword from './pages/rider/profile/reset/RiderProfileForgotPassword';
import RiderProfileVerifyOtp from './pages/rider/profile/reset/RiderProfileVerifyOtp';
import RiderProfileResetPassword from './pages/rider/profile/reset/RiderProfileResetPassword';
import RiderProfileSuccessState from './pages/rider/profile/reset/RiderProfileSuccessState';
import RiderChangePassword from './pages/rider/profile/reset/RiderChangePassword';
import RiderNotifications from './pages/rider/notifications/RiderNotifications';

function App() {
  return (
    <>
      <Routes>
        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/reset-success" element={<ResetSuccess />} />


        {/* Rider Onboarding & Auth Routes */}
        <Route path="/rider/welcome" element={<RiderPublicRoute><RiderWelcome /></RiderPublicRoute>} />
        <Route path="/rider/login" element={<RiderPublicRoute><RiderLogin /></RiderPublicRoute>} />
        <Route path="/rider/forgot-password" element={<RiderPublicRoute><RiderForgotPassword /></RiderPublicRoute>} />
        <Route path="/rider/verify-otp" element={<RiderPublicRoute><RiderVerifyOtp /></RiderPublicRoute>} />
        <Route path="/rider/reset-password" element={<RiderPublicRoute><RiderResetPassword /></RiderPublicRoute>} />
        <Route path="/rider/success" element={<RiderPublicRoute><RiderSuccessState /></RiderPublicRoute>} />

        {/* Rider Main App Routes */}
        <Route 
          path="/rider/app" 
          element={
            <RiderProtectedRoute>
              <RiderLayout />
            </RiderProtectedRoute>
          }
        >
          <Route path="dashboard" element={<RiderDashboard />} />
          <Route path="order/details/:orderId" element={<OrderDetails />} />
          <Route path="active-order/:orderId" element={<ActiveOrder />} />
          <Route path="active-order" element={<ActiveOrder />} />
          <Route path="history" element={<RiderHistory />} />
          <Route path="notifications" element={<RiderNotifications />} />
          <Route path="profile" element={<RiderProfile />} />
          <Route path="profile/reset/change-password" element={<RiderChangePassword />} />
          <Route path="profile/reset/forgot-password" element={<RiderProfileForgotPassword />} />
          <Route path="profile/reset/verify-otp" element={<RiderProfileVerifyOtp />} />
          <Route path="profile/reset/new-password" element={<RiderProfileResetPassword />} />
          <Route path="profile/reset/success" element={<RiderProfileSuccessState />} />
        </Route>

        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* for mobile app */}
        <Route path="/mobile/privacy-policy" element={<MobilePrivacyPolicy />} />
        <Route path="/mobile/terms-and-conditions" element={<MobileTermsAndConditions />} />
        <Route path="/delete-account-mobile" element={<MobileDeleteAccount />} />

   
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customers" element={<Customers />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="riders" element={<Riders />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="push-notifications" element={<PushNotifications />} />
          <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl font-bold bg-zinc-50 text-zinc-900">404 - Not Found</div>} />
        </Route>
   
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
