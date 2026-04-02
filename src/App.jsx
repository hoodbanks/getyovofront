import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import Customers from './pages/admin/Customers';
import Vendors from './pages/admin/Vendors';
import Riders from './pages/admin/Riders';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import Settings from './pages/admin/Settings';

import Login from './pages/admin/auth/Login';
import ForgotPassword from './pages/admin/auth/ForgotPassword';
import VerifyEmail from './pages/admin/auth/VerifyEmail';
import ResetPassword from './pages/admin/auth/ResetPassword';
import ResetSuccess from './pages/admin/auth/ResetSuccess';

// Customer Components (Onboarding & Auth)
import CustomerSplash from './pages/customer/onboarding/Splash';
import CustomerOnboarding from './pages/customer/onboarding/Onboarding';
import CustomerWelcome from './pages/customer/onboarding/Welcome';
import CustomerLogin from './pages/customer/auth/Login';
import CustomerRegister from './pages/customer/auth/Register';
import CustomerForgotPassword from './pages/customer/auth/ForgotPassword';
import CustomerVerifyOtp from './pages/customer/auth/VerifyOtp';
import CustomerResetPassword from './pages/customer/auth/ResetPassword';
import CustomerSuccessState from './pages/customer/auth/SuccessState';

// Customer Main App Components (Without Bottom Nav or Detail overlay layers)
import CustomerStoreDetail from './pages/customer/home/StoreDetail';
import CustomerItemDetail from './pages/customer/home/ItemDetail';
import CustomerReviews from './pages/customer/home/Reviews';
import CustomerCheckout from './pages/customer/cart/Checkout';
import CustomerOrderConfirmed from './pages/customer/cart/OrderConfirmed';
import CustomerPersonalData from './pages/customer/profile/PersonalData';
import CustomerAddresses from './pages/customer/profile/Addresses';
import CustomerPassword from './pages/customer/profile/Password';

// Customer Core App Components (With Bottom Nav)
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerHome from './pages/customer/home/Home';
import CustomerSearch from './pages/customer/search/Search';
import CustomerCart from './pages/customer/cart/Cart';
import CustomerProfile from './pages/customer/profile/Profile';
import CustomerNotifications from './pages/customer/notifications/Notifications';

// Rider Pages
import RiderWelcome from './pages/rider/onboarding/RiderWelcome';
import RiderLogin from './pages/rider/auth/RiderLogin';
import RiderForgotPassword from './pages/rider/auth/RiderForgotPassword';
import RiderVerifyOtp from './pages/rider/auth/RiderVerifyOtp';
import RiderResetPassword from './pages/rider/auth/RiderResetPassword';
import RiderSuccessState from './pages/rider/auth/RiderSuccessState';
import RiderLayout from './components/rider/RiderLayout';
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

function App() {
  return (
    <Routes>
      {/* Admin Auth Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/verify-email" element={<VerifyEmail />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin/reset-success" element={<ResetSuccess />} />

      {/* Customer Onboarding & Auth Routes */}
      <Route path="/customer/splash" element={<CustomerSplash />} />
      <Route path="/customer/onboarding" element={<CustomerOnboarding />} />
      <Route path="/customer/welcome" element={<CustomerWelcome />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/customer/forgot-password" element={<CustomerForgotPassword />} />
      <Route path="/customer/verify-otp" element={<CustomerVerifyOtp />} />
      <Route path="/customer/reset-password" element={<CustomerResetPassword />} />
      <Route path="/customer/success" element={<CustomerSuccessState />} />

      {/* Customer Independent/Detail Views */}
      <Route path="/customer/store/:id" element={<CustomerStoreDetail />} />
      <Route path="/customer/item/:id" element={<CustomerItemDetail />} />
      <Route path="/customer/item/:id/reviews" element={<CustomerReviews />} />
      <Route path="/customer/checkout" element={<CustomerCheckout />} />
      <Route path="/customer/order-confirmed" element={<CustomerOrderConfirmed />} />
      <Route path="/customer/profile/personal-data" element={<CustomerPersonalData />} />
      <Route path="/customer/profile/addresses" element={<CustomerAddresses />} />
      <Route path="/customer/profile/password" element={<CustomerPassword />} />
      <Route path="/customer/notifications" element={<CustomerNotifications />} />

      {/* Customer Main App Routes (Bottom Nav context) */}
      <Route path="/customer/app" element={<CustomerLayout />}>
        <Route path="home" element={<CustomerHome />} />
        <Route path="search" element={<CustomerSearch />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Rider Onboarding & Auth Routes */}
      <Route path="/rider/welcome" element={<RiderWelcome />} />
      <Route path="/rider/login" element={<RiderLogin />} />
      <Route path="/rider/forgot-password" element={<RiderForgotPassword />} />
      <Route path="/rider/verify-otp" element={<RiderVerifyOtp />} />
      <Route path="/rider/reset-password" element={<RiderResetPassword />} />
      <Route path="/rider/success" element={<RiderSuccessState />} />

      {/* Rider Main App Routes */}
      <Route path="/rider/app" element={<RiderLayout />}>
        <Route path="dashboard" element={<RiderDashboard />} />
        <Route path="order/details" element={<OrderDetails />} />
        <Route path="active-order" element={<ActiveOrder />} />
        <Route path="history" element={<RiderHistory />} />
        <Route path="profile" element={<RiderProfile />} />
        <Route path="profile/reset/change-password" element={<RiderChangePassword />} />
        <Route path="profile/reset/forgot-password" element={<RiderProfileForgotPassword />} />
        <Route path="profile/reset/verify-otp" element={<RiderProfileVerifyOtp />} />
        <Route path="profile/reset/new-password" element={<RiderProfileResetPassword />} />
        <Route path="profile/reset/success" element={<RiderProfileSuccessState />} />
      </Route>

      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="customers" element={<Customers />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="riders" element={<Riders />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl font-bold bg-zinc-50 text-zinc-900">404 - Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
