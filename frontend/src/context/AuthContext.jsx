import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, login as apiLogin, getUsers } from '../services/api';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = async () => {
    const savedRole = localStorage.getItem('nyaya_active_role') || 'ADMIN';
    const token = localStorage.getItem('nyaya_token');

    if (token) {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        const fallback = MOCK_USERS.find(u => u.role === savedRole) || MOCK_USERS[0];
        setUser(fallback);
      }
    } else {
      // Default to the saved role or ADMIN
      const fallback = MOCK_USERS.find(u => u.role === savedRole) || MOCK_USERS[0];
      setUser(fallback);
      localStorage.setItem('nyaya_token', `demo-token-${fallback.role.toLowerCase()}`);
      localStorage.setItem('nyaya_active_role', fallback.role);
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
      const activeUser = data.user || await getMe();
      setUser(activeUser);
      localStorage.setItem('nyaya_active_role', activeUser.role);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    }
  };

  const switchRole = (newRole) => {
    const targetUser = MOCK_USERS.find(u => u.role === newRole) || MOCK_USERS[0];
    localStorage.setItem('nyaya_active_role', targetUser.role);
    localStorage.setItem('nyaya_token', `demo-token-${targetUser.role.toLowerCase()}`);
    setUser(targetUser);
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
        activeRole: user?.role || 'ADMIN',
        login,
        logout,
        switchRole,
        availableRoles: MOCK_USERS,
        loading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
