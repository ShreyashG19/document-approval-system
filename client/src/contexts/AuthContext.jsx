import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempUser, setTempUser] = useState(null);

  // Wrap setter so isAuthenticated stays in sync with loggedInUser
  const setLoggedInUser = (user) => {
    setLoggedInUserState(user);
    setIsAuthenticated(!!user);
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      // Backend returns: { status, message, data: { user } }
      const result = await authService.getSession();
      setLoggedInUser(result.data.user);
    } catch {
      setLoggedInUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedInUser(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        isAuthenticated,
        loading,
        tempUser,
        setTempUser,
        checkAuthStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
