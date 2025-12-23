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
// 🎤 Hacker's Hello - Cute Chibi Edition
// ═══════════════════════════════════════════════════════════════

// Cute Chibi ASCII Art
console.log(
  `%c
      ╱|、
    (˚ˎ 。7    ♪ Nyaa~ Welcome Developer!
     |、˜〵          
     じしˍ,)ノ   
  `,
  'color: #ff69b4; font-size: 16px; font-family: monospace;'
);

// Main Cute Banner
console.log(
  `%c
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃                                                              ┃
  ┃       ⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⡀⠀⠀⠀⠀⠀                                  ┃
  ┃       ⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀                                  ┃
  ┃       ⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀                                  ┃
  ┃       ⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀                                  ┃
  ┃       ⠀⢸⣿⣿⡏⠉⠀⠀⠀⠀⠀⠀⠀⠀⠉⢹⣿⡇⠀   (◕‿◕✿)                    ┃
  ┃       ⠀⢸⣿⣿⣇⠀⠀⣀⣤⠀⠀⣤⣀⠀⠀⣸⣿⡇⠀                                  ┃
  ┃       ⠀⠀⢿⣿⣿⣆⠀⠈⠋⠀⠀⠙⠁⠀⣰⣿⡿⠀⠀                                  ┃
  ┃       ⠀⠀⠈⢿⣿⣿⣷⣤⣀⣀⣀⣀⣤⣾⣿⡿⠁⠀⠀                                  ┃
  ┃       ⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⡿⠟⠋⠁⠀⠀⠀⠀                                  ┃
  ┃                                                              ┃
  ┃   ╭─────────────────────────────────────────────────────╮    ┃
  ┃   │  ♪ ♫  BKN VISITOR MANAGEMENT SYSTEM v1.6.4  ♫ ♪    │    ┃
  ┃   ╰─────────────────────────────────────────────────────╯    ┃
  ┃                                                              ┃
  ┃   👤 Developer : Kharisma Satria Nindhita (Sandi)            ┃
  ┃   📧 Email     : satrianindhita6@gmail.com                   ┃
  ┃   🏢 Client    : BKN - Direktorat INTIKAMI                   ┃
  ┃                                                              ┃
  ┃   ╭───────────────────────────────────────────╮              ┃
  ┃   │  "Code with passion, debug with patience" │              ┃
  ┃   ╰───────────────────────────────────────────╯              ┃
  ┃                                                              ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  `,
  'color: #39c5bb; font-weight: bold; font-size: 11px; background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%); padding: 15px; border-radius: 10px; text-shadow: 0 0 8px #39c5bb; border: 1px solid #39c5bb;'
);

// Cute footer message
console.log(
  '%c(ﾉ◕ヮ◕)ﾉ*:・゚✧ If you found a bug, it\'s actually a secret feature! ✧゚・: *',
  'color: #ff69b4; font-size: 12px; font-style: italic; padding: 5px;'
);

console.log(
  '%c🔐 Security Notice: This console is monitored. Unauthorized access is prohibited.',
  'color: #ff6b6b; font-size: 10px; font-weight: bold;'
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
