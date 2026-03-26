import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export const RoleGuard = ({ allowedRoles, children }) => {
  const { loggedInUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!loggedInUser) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(loggedInUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const GuestGuard = ({ children }) => {
  const { isAuthenticated, loggedInUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated && loggedInUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
