import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Gardening from './pages/Gardening';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import CustomerDashboard from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminLocations } from './pages/admin/AdminLocations';
import { StockDashboard } from './pages/stock/StockDashboard';
import { StockInventory } from './pages/stock/StockInventory';
import { StockMovements } from './pages/stock/StockMovements';
import { ProtectedRoute } from './components/ProtectedRoute';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'STOCK_MANAGER') return <Navigate to="/stock" replace />;
  return <Navigate to="/customer/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', borderRadius: 0 } }} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/gardening" element={<Gardening />} />
              <Route path="/nursery" element={<Navigate to="/gardening" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/studio" element={<Navigate to="/" replace />} />
              <Route path="/visualizer" element={<Navigate to="/" replace />} />
              {/* Customer */}
              <Route path="/customer/dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute roles={['CUSTOMER']}><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute roles={['CUSTOMER']}><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute roles={['CUSTOMER']}><Orders /></ProtectedRoute>} />
              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute roles={['ADMIN']}><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={['ADMIN']}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute roles={['ADMIN']}><AdminCustomers /></ProtectedRoute>} />
              <Route path="/admin/locations" element={<ProtectedRoute roles={['ADMIN']}><AdminLocations /></ProtectedRoute>} />
              {/* Stock Manager */}
              <Route path="/stock" element={<ProtectedRoute roles={['STOCK_MANAGER', 'ADMIN']}><StockDashboard /></ProtectedRoute>} />
              <Route path="/stock/inventory" element={<ProtectedRoute roles={['STOCK_MANAGER', 'ADMIN']}><StockInventory /></ProtectedRoute>} />
              <Route path="/stock/movements" element={<ProtectedRoute roles={['STOCK_MANAGER', 'ADMIN']}><StockMovements /></ProtectedRoute>} />
              {/* Role redirect */}
              <Route path="/dashboard" element={<RoleRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
