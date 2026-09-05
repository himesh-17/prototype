import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, login as apiLogin } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = async () => {
    const token = localStorage.getItem('nyaya_token');
    if (token) {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        localStorage.removeItem('nyaya_token');
        localStorage.removeItem('nyaya_active_role');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('nyaya_token', data.access_token);
      const userData = await getMe();
      setUser(userData);
      localStorage.setItem('nyaya_active_role', userData.role);
      return true;
    } catch (err) {
      setError(err.detail || err.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('nyaya_token');
    localStorage.removeItem('nyaya_active_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole: user?.role || null,
        login,
        logout,
        loading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
