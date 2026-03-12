import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      };
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      };
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const getStoredUser = () => {
  try {
    // Kirli localStorage verilerini temizle
    if (localStorage.getItem('user') === 'undefined') {
      localStorage.removeItem('user');
    }
    if (localStorage.getItem('token') === 'undefined') {
      localStorage.removeItem('token');
    }
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      
      // Backend'den gelen format: {success: true, message: "...", token: "...", role: "...", user: {...}}
      const { token, user: backendUser } = response.data;
      
      console.log('Backend user:', backendUser);
      console.log('Parsed token:', token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(backendUser));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: backendUser, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Giriş başarısız oldu';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'REGISTER_START' });
      
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });

      console.log('Register response:', response.data);
      
      // Backend'den gelen format: {success: true, message: "...", token: "...", role: "..."}
      const { token, role } = response.data;
      
      // User objesi oluştur
      const user = {
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      };
      
      console.log('Created user:', user);
      console.log('Parsed token:', token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kayıt başarısız oldu';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
