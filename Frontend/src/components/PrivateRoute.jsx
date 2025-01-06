// components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    // Log para debug
    console.log('PrivateRoute - isAuthenticated:', isAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;