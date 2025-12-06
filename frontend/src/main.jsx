import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx' // Import Satpam

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
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

          {/* Redirect Default */}
          <Route path="/admin" element={<AdminLoginPage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)
