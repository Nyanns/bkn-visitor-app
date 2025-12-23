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
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics.jsx'))
const AdminMasterDataPage = lazy(() => import('./pages/AdminMasterDataPage.jsx'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'))

// ═══════════════════════════════════════════════════════════════
// 🎤 Hacker's Hello - Hatsune Miku Edition
// ═══════════════════════════════════════════════════════════════
console.log(
  `%c
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ♪ ♫ BKN VISITOR MANAGEMENT SYSTEM v1.6.4 ♫ ♪           ║
  ║                                                           ║
  ║   ┌─────────┐                                             ║
  ║   │  ♪ 39  │  "The world is mine~"                       ║
  ║   └─────────┘                                             ║
  ║                                                           ║
  ║   🎤 Built by: Kharisma Satria Nindhita (Sandi)          ║
  ║   📧 Email: satrianindhita6@gmail.com                     ║
  ║   🎵 "Code is poetry, bugs are just remix versions."      ║
  ║                                                           ║
  ║   ネギを持って、コードを書こう！                          ║
  ║   (Grab your leek and let's code!)                        ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `,
  'color: #39c5bb; font-weight: bold; font-size: 12px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 15px; border-radius: 8px; text-shadow: 0 0 10px #39c5bb;'
);

console.log(
  '%c🎀 Miku says: "If you found a bug, it\'s a feature in disguise~" 🎀',
  'color: #ff69b4; font-size: 11px; font-style: italic;'
);

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

            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } />

            <Route path="/admin/master-data" element={
              <ProtectedRoute>
                <AdminMasterDataPage />
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
