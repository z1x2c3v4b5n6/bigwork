import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RequireAdminProps {
  children: ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
