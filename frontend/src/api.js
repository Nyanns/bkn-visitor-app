// File: frontend/src/api.js
import axios from 'axios';

// Alamat Backend Python (FastAPI)
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        // Header ini penting agar backend tahu kita kirim data form/file
        'Content-Type': 'multipart/form-data',
    },
});

export default api;