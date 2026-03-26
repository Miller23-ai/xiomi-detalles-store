import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Store
import { StoreLayout } from './pages/StoreMisc'
import HomePage from './pages/store/HomePage'
import CatalogoPage from './pages/store/CatalogoPage'
import ProductPage from './pages/store/ProductPage'
import { NosotrasPage } from './pages/StoreMisc'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import { AdminLayout } from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductos from './pages/admin/AdminProductos'
import AdminPedidos from './pages/admin/AdminPedidos'
import { AdminClientes, AdminReportes, AdminConfig } from './pages/admin/AdminPages'

function AdminRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-9 h-9 border-4 border-rose-900 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <AdminLogin />
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index           element={<AdminDashboard />} />
        <Route path="pedidos"  element={<AdminPedidos />} />
        <Route path="productos"element={<AdminProductos />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="config"   element={<AdminConfig />} />
        <Route path="*"        element={<Navigate to="/admin" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Public store */}
          <Route element={<StoreLayout />}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/catalogo"      element={<CatalogoPage />} />
            <Route path="/producto/:id"  element={<ProductPage />} />
            <Route path="/nosotras"      element={<NosotrasPage />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin/*" element={
            <AuthProvider>
              <AdminRoutes />
            </AuthProvider>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
