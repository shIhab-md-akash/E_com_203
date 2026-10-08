import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

// Public & Customer Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { DocsAndArchitecturePage } from './pages/DocsAndArchitecturePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductManagementPage } from './pages/admin/AdminProductManagementPage';
import { AdminCategoryManagementPage } from './pages/admin/AdminCategoryManagementPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrderManagementPage } from './pages/admin/AdminOrderManagementPage';
import { AdminCustomerManagementPage } from './pages/admin/AdminCustomerManagementPage';
import { AdminCouponManagementPage } from './pages/admin/AdminCouponManagementPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Customer Layout Wrapper
const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Storefront Routes */}
                <Route
                  path="/"
                  element={
                    <StorefrontLayout>
                      <HomePage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <StorefrontLayout>
                      <ProductsPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <StorefrontLayout>
                      <ProductDetailPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <StorefrontLayout>
                      <CategoriesPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <StorefrontLayout>
                      <CartPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <StorefrontLayout>
                      <WishlistPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <StorefrontLayout>
                        <CheckoutPage />
                      </StorefrontLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <StorefrontLayout>
                        <OrderHistoryPage />
                      </StorefrontLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <StorefrontLayout>
                        <OrderDetailPage />
                      </StorefrontLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/track"
                  element={
                    <StorefrontLayout>
                      <OrderTrackingPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/orders/track/:orderNumber"
                  element={
                    <StorefrontLayout>
                      <OrderTrackingPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <StorefrontLayout>
                      <LoginPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <StorefrontLayout>
                      <RegisterPage />
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <StorefrontLayout>
                        <ProfilePage />
                      </StorefrontLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <StorefrontLayout>
                        <CustomerDashboardPage />
                      </StorefrontLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/docs"
                  element={
                    <StorefrontLayout>
                      <DocsAndArchitecturePage />
                    </StorefrontLayout>
                  }
                />

                {/* Admin Management Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductManagementPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategoryManagementPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminRoute>
                      <AdminInventoryPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrderManagementPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <AdminRoute>
                      <AdminCustomerManagementPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <AdminRoute>
                      <AdminCouponManagementPage />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
