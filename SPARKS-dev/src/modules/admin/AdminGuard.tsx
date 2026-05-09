import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../constants/admin';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

    return <>{children}</>;
};

export default AdminGuard;
