import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        // Kalau tidak ada token, tendang ke halaman login
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;