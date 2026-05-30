import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'RESTORE_TOKEN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: !!action.payload.token, loading: false };
    default:
      return state;
  }
};

const initialState = { user: null, token: null, isAuthenticated: false, loading: true };

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const userStr = await SecureStore.getItemAsync('user');
        const user = userStr ? JSON.parse(userStr) : null;
        dispatch({ type: 'RESTORE_TOKEN', payload: { token, user } });
      } catch {
        dispatch({ type: 'RESTORE_TOKEN', payload: { token: null, user: null } });
      }
    };
    restoreToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Giriş başarısız' };
    }
  };

  const register = async (name, email, password, department) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, department });
      const { token } = response.data;
      const user = { name, email, department, role: 'user' };
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Kayıt başarısız' };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token: state.token, user } });
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
