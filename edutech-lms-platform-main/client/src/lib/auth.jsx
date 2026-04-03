/**
 * Authentication Context & Provider
 * 
 * Provides global auth state to the entire React app via Context API.
 * 
 * Exposed values:
 *   - user       — Current user object (null if not logged in)
 *   - loading    — True while initial auth check is in progress
 *   - isAdmin    — Boolean, true if user email matches VITE_ADMIN_EMAIL
 *   - login()    — Authenticate and set user state
 *   - register() — Create account and set user state
 *   - logout()   — Clear session cookie and user state
 *   - fetchUser()— Re-fetch user data from server
 *   - updateUser()— Manually update local user state (e.g., after profile edit)
 * 
 * Auth persistence: JWT is stored in httpOnly cookie (server-side).
 *   On mount, fetchUser() checks if the cookie is valid by calling GET /api/getUser.
 *   If the cookie has expired or is missing, user is set to null.
 * 
 * NOTE: isAdmin is determined client-side by comparing user email to VITE_ADMIN_EMAIL.
 *       The actual authorization happens server-side via adminRoute middleware.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';


// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Auth Provider Component
export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount and when needed
  const fetchUser = async () => {
    try {
      // Add a timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await api.get('/getUser', { signal: controller.signal });
      clearTimeout(timeoutId);
      setUser(response.data);
      return response.data;

    } catch (error) {
      setUser(null);
      return null;

    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.admin === true || user?.email === import.meta.env.VITE_ADMIN_EMAIL;


  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data.success) {
        // Fetch user data after login
        const userData = await fetchUser();
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message };
  
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };


  // Register function
  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/register', { fullName, email, password });
      
      if (response.data.success) {
        // Fetch user data after registration
        const userData = await fetchUser();
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message };
    
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };


  // Logout function
  const logout = async () => {
    try {
      
      await api.post('/logout');
      setUser(null);
      return { success: true };
    
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state
      setUser(null);
      return { success: false };
    }
  };


  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
  };


  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);


  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    updateUser,
  };

  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
