import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest
} from '../services/legalService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const normalizeUser = (raw) => {
    if (!raw) return null;
    const email = raw.email;
    const role = raw.role || 'member';
    const name = email ? email.split('@')[0] : 'User';
    return { ...raw, email, role, name };
  };

  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const data = await getCurrentUser();
      const normalized = normalizeUser(data);
      setUser(normalized);
      window.localStorage.setItem('user', JSON.stringify(normalized));
    } catch {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        const storedUser =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('user')
            : null;
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            await fetchCurrentUser();
          }
        } else {
          await fetchCurrentUser();
        }
      }
      setInitialLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const data = await loginRequest(email, password);
      const accessToken = data?.access_token;
      if (!accessToken) {
        throw new Error('No access token returned from server');
      }

      window.localStorage.setItem('token', accessToken);
      await fetchCurrentUser();
      navigate('/');
    } catch (error) {
      if (error.response?.data?.detail) {
        setAuthError(error.response.data.detail);
      } else {
        setAuthError(
          error.message || 'Unable to login. Please check your credentials.'
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await registerRequest(email, password);
      navigate('/login', { state: { registered: true, email } });
    } catch (error) {
      if (error.response?.data?.detail) {
        setAuthError(error.response.data.detail);
      } else if (error.response?.data) {
        setAuthError(JSON.stringify(error.response.data));
      } else {
        setAuthError(
          error.message || 'Unable to register. Please try again.'
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const clearAuthError = () => setAuthError(null);

  const value = {
    user,
    token,
    initialLoading,
    authLoading,
    authError,
    login,
    register,
    logout,
    clearAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

