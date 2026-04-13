import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { CustomersPage } from './pages/CustomersPage'
import { ConfigPage } from './pages/ConfigPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes - All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            }
            path="/home"
          />
        </Route>

        {/* Customers Routes - Admin can create/edit/delete */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AppLayout>
                <CustomersPage />
              </AppLayout>
            }
            path="/customers"
          />
        </Route>

        {/* Admin-only Routes - RBAC */}
        <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
          <Route
            element={
              <AppLayout>
                <ConfigPage />
              </AppLayout>
            }
            path="/config"
          />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
