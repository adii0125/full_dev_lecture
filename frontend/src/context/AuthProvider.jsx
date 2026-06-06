import { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AUTH_CHANGE_EVENT } from '../base_api/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('access') || localStorage.getItem('refresh')));
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    function syncAuthState() {
      const token = localStorage.getItem('access') || localStorage.getItem('refresh');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }

    syncAuthState();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, [location]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
