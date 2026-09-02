import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, login as apiLogin } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nyaya_token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('nyaya_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('nyaya_token', data.access_token);
      const userData = await getMe();
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('nyaya_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
