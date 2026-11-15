import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import StatusPage from './pages/StatusPage';
import { Toaster } from 'sonner';

import RiderLayout from './components/rider/RiderLayout';
import RiderMaintenanceGate from './components/rider/RiderMaintenanceGate';
import RiderProtectedRoute from './components/rider/RiderProtectedRoute';
import RiderPublicRoute from './components/rider/RiderPublicRoute';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const MobilePrivacyPolicy = lazy(() => import('./pages/legal/MobilePrivacyPolicy'));
const MobileTermsAndConditions = lazy(() => import('./pages/legal/MobileTermsAndConditions'));
const DeleteAccount = lazy(() => import('./pages/account/DeleteAccount'));
const MobileDeleteAccount = lazy(() => import('./pages/account/MobileDeleteAccount'));
const Login = lazy(() => import('./pages/admin/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('./pages/admin/auth/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Vendors = lazy(() => import('./pages/admin/Vendors'));
const Riders = lazy(() => import('./pages/admin/Riders'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const PushNotifications = lazy(() => import('./pages/admin/PushNotifications'));
const Broadcast = lazy(() => import('./pages/admin/Broadcast'));
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'));
const SuperAdminAccounts = lazy(() => import('./pages/admin/SuperAdminAccounts'));
const AuditEvents = lazy(() => import('./pages/admin/AuditEvents'));
const Promotions = lazy(() => import('./pages/admin/Promotions'));
const ReferralActivities = lazy(() => import('./pages/admin/ReferralActivities'));
const VendorWallet = lazy(() => import('./pages/admin/wallet/VendorWallet'));
const VendorWalletDirectory = lazy(() => import('./pages/admin/wallet/VendorWalletDirectory').then((module) => ({ default: module.VendorWalletDirectory })));
const VendorWalletProfile = lazy(() => import('./pages/admin/wallet/VendorWalletDirectory').then((module) => ({ default: module.VendorWalletProfile })));
const UserWallet = lazy(() => import('./pages/admin/wallet/UserWallet'));
const UserWalletBalances = lazy(() => import('./pages/admin/wallet/UserWalletBalances'));
const UserWalletReconciliation = lazy(() => import('./pages/admin/wallet/UserWalletReconciliation'));
const RiderWelcome = lazy(() => import('./pages/rider/onboarding/RiderWelcome'));
const RiderLogin = lazy(() => import('./pages/rider/auth/RiderLogin'));
const RiderForgotPassword = lazy(() => import('./pages/rider/auth/RiderForgotPassword'));
const RiderVerifyOtp = lazy(() => import('./pages/rider/auth/RiderVerifyOtp'));
const RiderResetPassword = lazy(() => import('./pages/rider/auth/RiderResetPassword'));
const RiderSuccessState = lazy(() => import('./pages/rider/auth/RiderSuccessState'));
const RiderDashboard = lazy(() => import('./pages/rider/dashboard/RiderDashboard'));
const OrderDetails = lazy(() => import('./pages/rider/dashboard/OrderDetails'));
const ActiveOrder = lazy(() => import('./pages/rider/dashboard/ActiveOrder'));
const RiderHistory = lazy(() => import('./pages/rider/history/RiderHistory'));
const RiderProfile = lazy(() => import('./pages/rider/profile/RiderProfile'));
const RiderProfileSuccessState = lazy(() => import('./pages/rider/profile/reset/RiderProfileSuccessState'));
const RiderChangePassword = lazy(() => import('./pages/rider/profile/reset/RiderChangePassword'));
const RiderNotifications = lazy(() => import('./pages/rider/notifications/RiderNotifications'));

function App() {
  return (
    <>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">Loading page...</div>}>
      <Routes>
        {/* Standalone status pages */}
        <Route path="/403" element={<StatusPage code={403} />} />
        <Route path="/419" element={<StatusPage code={419} />} />
        <Route path="/500" element={<StatusPage code={500} />} />
        <Route path="/503" element={<StatusPage code={503} />} />

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/reset-password" element={<Navigate to="/admin/forgot-password" replace />} />
        <Route path="/admin/reset-success" element={<Navigate to="/admin/login" replace />} />


        {/* Rider website. Maintenance covers login and the signed-in app. Admin stays outside this gate. */}
        <Route element={<RiderMaintenanceGate />}>
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
          <Route path="profile/reset/success" element={<RiderProfileSuccessState />} />
        </Route>
        </Route>

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
          <Route path="transactions" element={<Transactions />} />
          <Route path="payments" element={<Payments />} />
          <Route path="wallet/vendor" element={<VendorWallet />} />
          <Route path="wallet/vendor/vendors" element={<VendorWalletDirectory />} />
          <Route path="wallet/vendor/vendors/:vendorId" element={<VendorWalletProfile />} />
          <Route path="wallet/user" element={<UserWallet />} />
          <Route path="wallet/user/balances" element={<UserWalletBalances />} />
          <Route path="wallet/user/reconciliation" element={<UserWalletReconciliation />} />
          <Route path="referral-activities" element={<ReferralActivities />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="accounts" element={<SuperAdminAccounts />} />
          <Route path="audit" element={<AuditEvents />} />
          <Route path="push-notifications" element={<PushNotifications />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="vendor-management" element={<VendorManagement />} />
          <Route path="*" element={<StatusPage code={404} />} />
        </Route>

        {/* Unknown addresses across the public, admin, and rider areas */}
        <Route path="*" element={<StatusPage code={404} />} />

      </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
