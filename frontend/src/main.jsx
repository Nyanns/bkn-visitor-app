import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'

// Lazy load admin pages for better performance and code splitting
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const AdminVisitorDetail = lazy(() => import('./pages/AdminVisitorDetail.jsx'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Suspense fallback={
          <Center minH="100vh">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Center>
        }>
          <Routes>
            {/* USER (Bebas Akses) */}
            <Route path="/" element={<App />} />

            {/* ADMIN LOGIN (Pintu Masuk) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ADMIN AREA (Dilindungi Satpam) */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/register" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/visitor/:nik" element={
              <ProtectedRoute>
                <AdminVisitorDetail />
              </ProtectedRoute>
            } />

            <Route path="/admin/visitor/:nik" element={
              <ProtectedRoute>
                <AdminVisitorDetail />
              </ProtectedRoute>
            } />

            {/* Redirect Default */}
            <Route path="/admin" element={<AdminLoginPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
