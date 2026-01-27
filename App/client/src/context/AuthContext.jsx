import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // TEMPORARY BYPASS: Initialize with mock user directly
  const [user, setUser] = useState({
    id: 'mock-1',
    name: 'Alex Johnson',
    email: 'alex@insta.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false); // No loading needed

  useEffect(() => {
    // Optional: Still fetch real status if needed, but we start logged in
    // checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Keep this empty or just return to prevent overriding the mock user
    return;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data;

    // Save to LocalStorage for backward compatibility
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

