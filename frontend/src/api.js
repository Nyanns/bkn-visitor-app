// File: frontend/src/api.js
import axios from 'axios';

// Use environment variable for API base URL
// Default to localhost for development
// Override with VITE_API_URL in .env for production/server deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// --- INTERCEPTOR (Penyisip Token Otomatis) ---
api.interceptors.request.use(
    (config) => {
        // Ambil token dari penyimpanan lokal
        const token = localStorage.getItem('adminToken');

        // Jika token ada, tempelkan ke Header 'Authorization'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;