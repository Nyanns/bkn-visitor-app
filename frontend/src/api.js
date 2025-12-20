// File: frontend/src/api.js
import axios from 'axios';

// Use environment variable for API base URL
// Default to localhost for development
// Override with VITE_API_URL in .env for production/server deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // Enable sending Cookies
});

// --- INTERCEPTOR (Penyisip Token Otomatis) ---
// Note: Authorization header is no longer needed with HttpOnly Cookies.
// We keep the structure if we need other interceptors later.
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR (Auto-handle token expiry) ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token expired (401), auto logout and redirect
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- VISITOR MANAGEMENT ---
api.updateVisitorPhoto = (nik, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.put(`/visitors/${nik}/photo`, formData);
};

api.updateVisitorKtp = (nik, file) => {
    const formData = new FormData();
    formData.append('ktp', file);
    return api.put(`/visitors/${nik}/ktp`, formData);
};

// --- TASK LETTERS ---
api.getTaskLetters = (nik) => api.get(`/visitors/${nik}/task-letters`);

api.uploadTaskLetter = (nik, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/visitors/${nik}/task-letters`, formData);
};

api.deleteTaskLetter = (nik, type, id) => api.delete(`/visitors/${nik}/task-letters/${type}/${id}`);

export default api;