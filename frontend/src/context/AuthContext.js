// AuthContext.js - User authentication state management
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

// API Base URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set default authorization header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${parsedUser.token}`;
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = async (name, email, password, phone = "") => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/users`, {
        name,
        email,
        password,
        phone,
      });

      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userData.token}`;

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userData.token}`;

      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        updates
      );
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      setError(message);
      return { success: false, message };
    }
  };

  // Clear any errors
  const clearError = useCallback(() => setError(null), []);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
