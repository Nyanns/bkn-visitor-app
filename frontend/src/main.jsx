// File: frontend/src/main.jsx (YANG BENAR)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom' // <--- PENTING

// Import Halaman
import App from './App.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>  {/* <--- Router harus membungkus Routes */}
        <Routes>
          {/* Jalur Tamu */}
          <Route path="/" element={<App />} />

          {/* Jalur Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/register" element={<AdminPage />} />

          {/* Redirect */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)