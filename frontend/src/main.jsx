// File: frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Kita bungkus App dengan ChakraProvider agar bisa pakai komponen keren */}
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)