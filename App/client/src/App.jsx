import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Shell from './components/layout/Shell';
import ProtectedRoute from './components/ui/ProtectedRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import React, { Suspense } from 'react';

// Lazy Load Features for Extreme Efficiency
const Login = React.lazy(() => import('./features/auth/pages/Login'));
const Register = React.lazy(() => import('./features/auth/pages/Register'));
const Dashboard = React.lazy(() => import('./features/dashboard/pages/Dashboard'));
const Projects = React.lazy(() => import('./features/operations/pages/Projects'));
const FileManager = React.lazy(() => import('./features/operations/pages/FileManager'));
const Ecommerce = React.lazy(() => import('./features/ecommerce/pages/Ecommerce'));
const Email = React.lazy(() => import('./features/communication/pages/Email'));
const Chat = React.lazy(() => import('./features/communication/pages/Chat'));
const Social = React.lazy(() => import('./features/communication/pages/Social'));
const Cart = React.lazy(() => import('./features/ecommerce/pages/Cart'));
const Wishlist = React.lazy(() => import('./features/ecommerce/pages/Wishlist'));
const Checkout = React.lazy(() => import('./features/ecommerce/pages/Checkout'));
const Orders = React.lazy(() => import('./features/ecommerce/pages/Orders'));
const Tracking = React.lazy(() => import('./features/ecommerce/pages/Tracking'));
const Profile = React.lazy(() => import('./features/profile/pages/Profile'));
const Settings = React.lazy(() => import('./features/settings/pages/Settings'));

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes Wrapper */}
            <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="files" element={<FileManager />} />
              <Route path="ecommerce" element={<Ecommerce />} />
              <Route path="email" element={<Email />} />
              <Route path="chat" element={<Chat />} />
              <Route path="social" element={<Social />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="tracking/:id" element={<Tracking />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;
