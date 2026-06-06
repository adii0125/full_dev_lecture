import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { AuthContext } from './AuthProvider';

export function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
