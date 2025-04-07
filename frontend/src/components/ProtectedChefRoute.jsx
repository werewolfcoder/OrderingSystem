import { Navigate } from 'react-router-dom';
import { useChefAuth } from '../hooks/useChefAuth';

const ProtectedChefRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useChefAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/chef/login" replace />;
  }

  return children;
};

export default ProtectedChefRoute;
