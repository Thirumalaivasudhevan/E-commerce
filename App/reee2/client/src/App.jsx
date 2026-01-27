import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Shell from './components/layout/Shell';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import FileManager from './pages/FileManager';
import Ecommerce from './pages/Ecommerce';
import Email from './pages/Email';
import Chat from './pages/Chat';
import Social from './pages/Social';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import Pricing from './pages/Pricing';
import ProductInventory from './pages/ProductInventory';
import PaymentConfig from './pages/PaymentConfig';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="files" element={<FileManager />} />
          <Route path="ecommerce" element={<Ecommerce />} />
          <Route path="ecommerce/:id" element={<ProductDetail />} />
          <Route path="email" element={<Email />} />
          <Route path="chat" element={<Chat />} />
          <Route path="social" element={<Social />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="tracking/:id" element={<Tracking />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="inventory" element={<ProductInventory />} />
          <Route path="payment-config" element={<PaymentConfig />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
