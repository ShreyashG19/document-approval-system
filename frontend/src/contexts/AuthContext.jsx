import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();
export const useAuth = () => React.useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const login = () => {
  //   setIsAuthenticated(true);
  // };

  const logout = () => {
    setLoggedInUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const authUrl = import.meta.env.VITE_API_URL + "/auth/get-session";
      const response = await fetch(authUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log("Auth status response:", response);
      if (!response.ok) {
        const error = await response.json();
        console.log(error.message);
        throw new Error(`${response.message}`);
      }

      const result = await response.json();
      console.log("Auth status:", result);
      setLoggedInUser(result.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.log("AuthContext service :: checkAuthStatus :: error : ", error);
      setLoggedInUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        logout,
        loggedInUser,
        setLoggedInUser,
        tempUser,
        setTempUser,
        checkAuthStatus,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
